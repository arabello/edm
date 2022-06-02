#!/usr/bin/env node

import { Argument, Command, InvalidArgumentError } from "commander";
import { array, nonEmptyArray, record, semigroup, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { existsSync } from "fs";
import { getPlaylists, getUser, login } from "./api_spotify";
import { PullResourceFromYAML } from "./domain";
import { fromFile, pullResource } from "./download";
import { flatten } from "./resource";
import yaml from "js-yaml";
import fs from "fs";

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

  validateYamlExtension(filename);

  return filename;
};

const validateYamlExtension = (filename: string) => {
  if (!filename.endsWith(".yaml") && !filename.endsWith(".yml")) {
    throw new InvalidArgumentError(`File ${filename} is not a YAML file.`);
  }

  return filename;
};

const program = new Command();

program.name("edm").version("0.0.1").description("Spotify utilities for DJs");

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
  .action((file, options) => {
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

program
  .command("login")
  .description("Login to external services for advanced features")
  .addArgument(
    new Argument("<service>", "Service to login to").choices(["spotify"])
  )
  .action(() => {
    login();
  });

program
  .command("create")
  .description("Create YAML descriptor with your personal Spotify playlists")
  .addArgument(
    new Argument(
      "[file]",
      "Filename (default is Spotify display name)"
    ).argParser(validateYamlExtension)
  )
  .option("-if, --include-followed", "Include playlists you follow", false)
  .action((filename, options) => {
    getPlaylists()
      .then(async (playlists) => {
        const uid = options.includeFollowed
          ? undefined
          : await getUser().then((user) => user.body.id);

        const createFile = (filename: string) =>
          fs.writeFileSync(
            filename,
            yaml.dump(
              Object.assign(
                {},
                ...pipe(
                  playlists,
                  array.filter((p) => (uid ? p.owner.id === uid : true)),
                  array.map((p) => ({ [p.name]: p.external_urls.spotify }))
                )
              )
            )
          );

        if (filename) {
          createFile(filename);
        } else {
          getUser()
            .then((user) => {
              if (user.body.display_name) {
                createFile(`${user.body.display_name}.yaml`);
              } else {
                createFile(filename);
              }
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  });

program.parse();
