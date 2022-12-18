import { program } from "commander";
import {
  DEFAULT_BREAKING_CHANGE_HEADING,
  DEFAULT_CHANGE_TEMPLATE,
  DEFAULT_FEAT_HEADING,
  DEFAULT_FIX_HEADING,
  Options,
} from "../src/types/options";
import pkg from "../package.json";
import { generateChangelog } from "../src";
import simpleGit from "simple-git";

program
  .name("generate-changelog")
  .description(
    "CLI to generate a semi-conventional commits changelog. Output is written to stderr as JSON."
  )
  .version(pkg.version)
  .argument(
    "[dir]",
    "Optinoal path to the git repo. Defaults to your current working directory.",
    process.cwd()
  )
  .option(
    "--prefix <markdown>",
    "A markdown block that is included in the changelog before the changes"
  )
  .option(
    "--suffix <markdown>",
    "A markdown block that is included in the changelog after the changes"
  )
  .option(
    "--fix-heading <text>",
    "Custom heading for fixes",
    DEFAULT_FIX_HEADING
  )
  .option(
    "--feat-heading <text>",
    "Custom heading for features",
    DEFAULT_FEAT_HEADING
  )
  .option(
    "--breaking-change-heading <text>",
    "Custom heading for breaking changes",
    DEFAULT_BREAKING_CHANGE_HEADING
  )
  .option(
    "--change-template <text>",
    "Template.js template string for defining how change list items are rendered to the changelog.",
    DEFAULT_CHANGE_TEMPLATE
  )
  .option(
    "-m --module <text>",
    "The module to release. Only use for projects with multiple projects that are going to be release"
  )
  .option(
    "-s --scopes <scopes>",
    "Comma separated list of commit scopes to base the changelog off of",
    (value) => value.split(",").map((item) => item.trim())
  )
  .action(async (_, options: Options) => {
    console.log(_);
    const output = await generateChangelog(options);
    console.error(JSON.stringify(output, null, 2));
  })
  .parse();
