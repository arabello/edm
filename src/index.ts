#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { boolean, nonEmptyArray, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { PullResourceFromYAML } from "./domain";
import { fromFile, pullResource } from "./download";
import { flatten } from "./resource";

const validateInt = (value: string) => {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }

  return parsedValue;
};

const program = new Command();

program
  .name("spotpl")
  .version("0.0.1")
  .description("Download Spotify songs in a organized way")
  .argument("<file>", "YAML file to be processed")
  .option(
    "-nt, --n-threads <number>",
    "Number of threads used by spotDL",
    validateInt,
    4
  );

program.parse();

const options = program.opts();

pipe(
  program.args[0],
  fromFile(PullResourceFromYAML),
  taskEither.map(flatten),
  taskEither.chain(
    flow(
      nonEmptyArray.map((res) =>
        pipe(
          res.urls,
          nonEmptyArray.map(pullResource(res.path, options.nThreads))
        )
      ),
      nonEmptyArray.flatten,
      taskEither.sequenceArray
    )
  ),
  taskEither.mapLeft(console.error)
)();
