import { array, either, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import * as t from "io-ts";
import util from "util";
import { TaskEither } from "fp-ts/TaskEither";
import fs from "fs";
import { execSync } from "child_process";
import { AbsolutePath, Path, SpotifyURL } from "./domain";

const readFile = util.promisify(fs.readFile);

const eitherFromValidation = either.mapLeft(
  flow(
    array.reduce("", (acc, error) => `${acc}\n${error}`),
    Error
  )
);

export const fromFile: <T>(
  codec: t.Type<T, T, unknown>
) => (filename: Path) => TaskEither<Error, T> = (codec) => (filename) =>
  pipe(
    taskEither.tryCatch(() => readFile(filename, "utf8"), either.toError),
    taskEither.chain(
      flow(codec.decode, eitherFromValidation, taskEither.fromEither)
    )
  );

export const pullResource = (path: AbsolutePath) => (url: SpotifyURL) =>
  pipe(
    taskEither.tryCatch(
      () => fs.promises.mkdir(path, { recursive: true }),
      either.toError
    ),
    taskEither.map(() => {
      execSync(`spotdl ${url} --dt 8 --st 4`, {
        cwd: path,
        stdio: "inherit",
      });
    })
  );
