import { array, boolean, either, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import { existsSync, readFileSync } from "fs";
import * as t from "io-ts";
import yaml from "js-yaml";
import path, { isAbsolute } from "path";

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
    url: SpotifyURL,
    path: Path,
  },
  "PullResource"
);

export type PullResource = t.TypeOf<typeof PullResource>;

export const AbsolutePath = new t.Type<string, string, unknown>(
  "AbsolutePath",
  (input): input is string => typeof input === "string",
  (input, ctx) =>
    pipe(
      typeof input === "string" ? t.success(input) : t.failure(input, ctx),
      either.chain(Path.decode),
      either.chain((path: Path) =>
        isAbsolute(path) ? t.success(path) : t.failure(path, ctx)
      )
    ),
  t.identity
);

export type AbsolutePath = t.TypeOf<typeof AbsolutePath>;

export const SpotPLConfig = t.type(
  {
    rootDir: Path,
    resources: t.array(PullResource),
  },
  "SpotPLConfig"
);

export type SpotPLConfig = t.TypeOf<typeof SpotPLConfig>;

export const SpotPLConfigFromYAMLFile = new t.Type<
  SpotPLConfig,
  SpotPLConfig,
  unknown
>(
  "SpotPLConfigFromYAMLFile",
  (input): input is SpotPLConfig => SpotPLConfig.is(input),
  (input, ctx) =>
    pipe(
      typeof input === "string" ? t.success(input) : t.failure(input, ctx),
      either.chain((input: string) =>
        pipe(
          input,
          existsSync,
          boolean.fold(
            () => t.failure(input, ctx),
            () => t.success(input)
          )
        )
      ),
      either.chain((filename: string) => {
        try {
          return either.right(yaml.load(readFileSync(filename, "utf-8")));
        } catch (e) {
          return either.left(e);
        }
      }),
      either.chain(SpotPLConfig.decode)
    ),
  t.identity
);
