import { getInput, setOutput } from "@actions/core";
import { generateChangelog } from "../src";
import { Options } from "../src/types/options";

/**
 * Converts a comma separated list of strings into a `string[]`.
 */
function getStringArrayInput(name: string): string[] {
  return getInput(name)
    .split(",")
    .map((scope) => scope.trim());
}

function getOptions(): Options {
  let options: Options;
  const module = getInput("module");
  if (module) {
    options = {
      module,
      scopes: getStringArrayInput("scopes"),
    };
  } else {
    options = {};
  }
  options.breakingChangeHeading = getInput("breakingChangeHeading");
  options.featHeading = getInput("featHeading");
  options.fixHeading = getInput("fixHeading");
  options.prefix = getInput("prefix");
  options.suffix = getInput("suffix");

  return options;
}

async function main() {
  const options = getOptions();
  const outputs = await generateChangelog(options);
  Object.entries(outputs).map(([key, value]) => setOutput(key, value));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
