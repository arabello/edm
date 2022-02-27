import { array, boolean, either, string } from "fp-ts";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import * as tt from "io-ts-types";
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

const PullResource = t.recursion("PullResource", (self) =>
  t.record(Path, t.union([self, tt.nonEmptyArray(SpotifyURL), SpotifyURL]))
);

export type PullResource = t.TypeOf<typeof PullResource>;

export const PullResourceFromYAML = new t.Type<
  PullResource,
  PullResource,
  unknown
>(
  "PullResourceFromYAML",
  (input): input is PullResource => PullResource.is(input),
  (input, ctx) =>
    pipe(
      typeof input === "string" ? t.success(input) : t.failure(input, ctx),
      either.chain((input: string) => {
        try {
          return either.right(yaml.load(input));
        } catch (e) {
          return either.left(e);
        }
      }),
      either.chain(PullResource.decode)
    ),
  t.identity
);

export type PullResourceFromYAML = t.TypeOf<typeof PullResourceFromYAML>;

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
