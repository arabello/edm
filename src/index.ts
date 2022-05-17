#!/usr/bin/env node

import { Argument, Command, InvalidArgumentError } from "commander";
import { nonEmptyArray, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { existsSync } from "fs";
import { login } from "./api_spotify";
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

const validateFile = (filename: string) => {
  if (!existsSync(filename)) {
    throw new InvalidArgumentError(`File ${filename} does not exist.`);
  }

  if (!filename.endsWith(".yaml") && !filename.endsWith(".yml")) {
    throw new InvalidArgumentError(`File ${filename} is not a YAML file.`);
  }

  return filename;
};

const program = new Command();

program
  .name("spotpl")
  .version("0.0.1")
  .description("Download Spotify songs in an organized way");

program
  .command("login")
  .description("Login to external services for advanced features")
  .addArgument(
    new Argument("<service>", "Service to login to").choices(["spotify"])
  )
  .action(async () => {
    await login();
  });

program
  .command("pull")
  .description("Download Spotify music from a YAML descriptor")
  .argument("<file>", "YAML file to be processed", validateFile)
  .option(
    "-nt, --n-threads <number>",
    "Number of threads used by spotDL",
    validateInt,
    4
  )
  .action(([file, options, ...args]) => {
    pipe(
      file,
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
  });

program.parse();
