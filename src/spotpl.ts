import child_process from "child_process";
import { array, either, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import fs from "fs";
import path from "path";
import { Path, SpotifyURL, SpotPLConfig } from "./domain";

export const pull = (config: SpotPLConfig) =>
  pipe(
    config.resources,
    array.map((resource) =>
      pullResource(
        resource.url,
        path.resolve(`${config.rootDir}/${resource.path}`)
      )
    ),
    taskEither.sequenceArray
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
