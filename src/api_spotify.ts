import { either, taskEither } from "fp-ts";
import open from "open";
import { URLSearchParams } from "url";
import { pipe } from "fp-ts/function";
import express from "express";
import crypto from "crypto";
import randomstring from "randomstring";
import axios from "axios";
import base64url from "base64url";
import SpotifyWebApi from "spotify-web-api-node";
import config from "./config";

const SPOTIFY_CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = `${config.SPOTIFY_REDIRECT_URI_HOST}:${config.SPOTIFY_REDIRECT_URI_PORT}${config.SPOTIFY_REDIRECT_URI_PATH}`;
const SPOTIFY_SCOPES = ["playlist-read-private"];

var spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  redirectUri: SPOTIFY_REDIRECT_URI,
});

type AuthParams = {
  state: string;
};

type AuthParamsError = AuthParams & { error: string };
type AuthParamsSuccess = AuthParams & { code: string };

const foldAuthParams: <T>(match: {
  error: (params: AuthParamsError) => T;
  success: (params: AuthParamsSuccess) => T;
  other: () => T;
}) => (params: any) => T = (match) => (params) => {
  if ("state" in params && "code" in params) {
    return match.success(params);
  } else if ("state" in params && "error" in params) {
    return match.error(params);
  } else {
    return match.other();
  }
};

type AccessTokenSuccess = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

export const login = async () => {
  const code_verifier = randomstring.generate(64);
  const authorizeEndpoint = "https://accounts.spotify.com/authorize";
  const makeAuthorizeParams = (code_verifier: string) => ({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: randomstring.generate(16),
    code_challenge_method: "S256",
    code_challenge: base64url.encode(
      Buffer.from(crypto.createHash("sha256").update(code_verifier).digest())
    ),
  });

  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const tokenParams = (code: string, code_verifier: string) => ({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: code_verifier,
  });

  const app = express();
  const server = app.listen(config.SPOTIFY_REDIRECT_URI_PORT);

  app.get(config.SPOTIFY_REDIRECT_URI_PATH, (req, res) =>
    pipe(
      req.query,
      foldAuthParams({
        error: (params) =>
          taskEither.of(res.send(`Login failed: ${params.error}`)),
        success: (params) =>
          taskEither.tryCatch(async () => {
            const tokenReponse = await axios.post(
              tokenEndpoint,
              new URLSearchParams(
                tokenParams(params.code, code_verifier)
              ).toString(),
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );
            spotifyApi.setAccessToken(tokenReponse.data.access_token);
            spotifyApi.setRefreshToken(tokenReponse.data.refresh_token);
            server.close();
            return res.send("<script>window.close()</script>");
          }, either.toError),
        other: () =>
          taskEither.of(
            res.send("Login failed: Invalid response from Spotify")
          ),
      })
    )()
  );

  await open(
    `${authorizeEndpoint}?${new URLSearchParams(
      makeAuthorizeParams(code_verifier)
    ).toString()}`
  );

  return server;
};

export const getPlaylists = async () => {
  let playlists: Array<SpotifyApi.PlaylistObjectSimplified> = [];
  let response = await spotifyApi.getUserPlaylists();
  let offset = 0;
  while (response) {
    playlists = playlists.concat(response.body.items);
    if (!response.body.next) {
      break;
    }
    offset += 1;
    response = await spotifyApi.getUserPlaylists({ offset });
  }
  return Promise.resolve(playlists);
};

export const getUser = () => spotifyApi.getMe();
