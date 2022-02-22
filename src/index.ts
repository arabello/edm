import { Command } from "commander";

const program = new Command();

program
  .name("spotpl")
  .version("0.0.1")
  .description("Download Spotify songs in a organized way")
  .argument("<file>", "YAML file to be processed");

program.parse();
