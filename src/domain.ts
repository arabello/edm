import { array, boolean, either, option, record, string } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import * as t from "io-ts";
import path from "path";

const SPOTIFY_DOMAINS = ["https://open.spotify.com/"];

export const SpotifyURL = new t.Type<string, string, unknown>(
  "SpotifyURL",
  (input): input is string => typeof input === "string",
  (input, ctx) =>
    pipe(
      typeof input === "string" ? t.success(input) : t.failure(input, ctx),
      either.chain((input: string) =>
        pipe(
          SPOTIFY_DOMAINS,
          array.some((domain) => pipe(input, string.startsWith(domain))),
          boolean.fold(
            () => t.failure(input, ctx),
            () => t.success(input)
          )
        )
      )
    ),
  t.identity
);

export type SpotifyURL = t.TypeOf<typeof SpotifyURL>;

export const Path = new t.Type<string, string, unknown>(
  "Path",
  (input): input is string => typeof input === "string",
  (input, ctx) =>
    pipe(
      typeof input === "string" ? t.success(input) : t.failure(input, ctx),
      either.chain((input: string) =>
        pipe(
          path.parse(input).ext,
          string.isEmpty,
          boolean.fold(
            () => t.failure(input, ctx),
            () => t.success(input)
          )
        )
      )
    ),
  t.identity
);
export type Path = t.TypeOf<typeof Path>;

const PullResource = t.type(
  {
    spotifyURL: SpotifyURL,
    path: Path,
  },
  "PullResource"
);

export type PullResource = t.TypeOf<typeof PullResource>;

export const SpotPLConfig = t.type(
  {
    rootDir: Path,
    resources: t.array(PullResource),
  },
  "SpotPLConfig"
);

export type SpotPLConfig = t.TypeOf<typeof SpotPLConfig>;
