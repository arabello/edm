import * as flat from "flat";
import { nonEmptyArray } from "fp-ts";
import { identity, pipe } from "fp-ts/function";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import path from "path";
import { AbsolutePath, PullResource, SpotifyURL } from "./domain";

export type FlattenPullResource = NonEmptyArray<{
  path: AbsolutePath;
  urls: NonEmptyArray<SpotifyURL>;
}>;

export const flatten: (resource: PullResource) => FlattenPullResource = (res) =>
  pipe(
    flat.flatten(res, { delimiter: path.sep, safe: true }),
    Object.entries,
    nonEmptyArray.map(([key, value]: [string, string | string[]]) => ({
      path: key,
      urls: pipe(
        value,
        nonEmptyArray.of,
        Array.isArray(value) ? nonEmptyArray.flatten : identity
      ) as NonEmptyArray<SpotifyURL>,
    }))
  );
