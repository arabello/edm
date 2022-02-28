import { array, either, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/TaskEither";
import fs from "fs";
import * as t from "io-ts";
import util from "util";
import { AbsolutePath, Path, SpotifyURL } from "./domain";
import { spawnSync } from "child_process";

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

export const pullResource =
  (path: AbsolutePath, nThreads: number = 1) =>
  (url: SpotifyURL) =>
    pipe(
      taskEither.tryCatch(
        () => fs.promises.mkdir(path, { recursive: true }),
        either.toError
      ),
      taskEither.map(() => {
        const args = [url, "--dt", `${nThreads}`, "--st", `${nThreads}`];

        spawnSync(`spotdl`, args, {
          cwd: path,
          stdio: "inherit",
        });
      })
    );
