#!/usr/bin/env node

import { Command } from "commander";
import { nonEmptyArray, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { PullResourceFromYAML } from "./domain";
import { fromFile, pullResource } from "./download";
import { flatten } from "./resource";

const program = new Command();

program
  .name("spotpl")
  .version("0.0.1")
  .description("Download Spotify songs in a organized way")
  .argument("<file>", "YAML file to be processed");

program.parse();

const main = pipe(
  program.args[0],
  fromFile(PullResourceFromYAML),
  taskEither.map(flatten),
  taskEither.chain(
    flow(
      nonEmptyArray.map((res) =>
        pipe(res.urls, nonEmptyArray.map(pullResource(res.path)))
      ),
      nonEmptyArray.flatten,
      taskEither.sequenceArray
    )
  ),
  taskEither.mapLeft(console.error)
);

main();
