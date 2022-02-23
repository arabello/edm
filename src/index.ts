import { Command } from "commander";
import { array, either, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { SpotPLConfigFromYAMLFile } from "./domain";
import { pull } from "./spotpl";

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

const program = new Command();

program
  .name("spotpl")
  .version("0.0.1")
  .description("Download Spotify songs in a organized way")
  .argument("<file>", "YAML file to be processed");

program.parse();

pipe(program.args[0], pullFromConfig)();
