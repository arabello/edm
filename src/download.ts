import { array, either, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { pull } from "./resource";
import * as t from "io-ts";
import util from "util";
import { TaskEither } from "fp-ts/TaskEither";
const readFile = util.promisify(fs.readFile);

const eitherFromValidation = either.mapLeft(
  flow(
    array.reduce("", (acc, error) => `${acc}\n${error}`),
    Error
  )
);

const fromFile: <T>(
  filename: Path
) => (codec: t.Type<T, T, unknown>) => TaskEither<Error, T> =
  (filename) => (codec) =>
    pipe(
      taskEither.tryCatch(() => readFile(filename, "utf8"), either.toError),
      taskEither.chain(
        flow(codec.decode, eitherFromValidation, taskEither.fromEither)
      )
    );

const pullFromConfig = flow(
  SpotPLConfigFromYAMLFile.decode,
  either.mapLeft(
    flow(
      array.reduce("", (acc, err) => `${acc}\n${err.message}`),
      Error
    )
  ),
  taskEither.fromEither,
  taskEither.chain(pull),
  taskEither.mapLeft(console.error)
);

const pullResource = (url: SpotifyURL, path: Path) =>
  pipe(
    taskEither.tryCatch(
      () => fs.promises.mkdir(path, { recursive: true }),
      either.toError
    ),
    taskEither.map(() =>
      child_process.execSync(`spotdl ${url} --dt 8 --st 4`, {
        cwd: path,
        stdio: "inherit",
      })
    )
  );
