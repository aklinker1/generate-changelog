import { getInput, setOutput } from "@actions/core";
import { generateChangelog } from "../src";
import { Options } from "../src/types/options";

/**
 * Converts a comma separated list of strings into a `string[]`.
 */
function getOptionalStringArrayInput(name: string): string[] | undefined {
  return getOptionalInput(name)
    ?.split(",")
    .map((scope) => scope.trim());
}

function getOptionalInput(name: string): string | undefined {
  return getInput(name) || undefined;
}

function getOptions(): Options {
  let options: Options;
  const module = getOptionalInput("module");
  if (module) {
    options = {
      module,
      scopes: getOptionalStringArrayInput("scopes"),
    };
  } else {
    options = {};
  }
  options.breakingChangeHeading = getOptionalInput("breakingChangeHeading");
  options.featHeading = getOptionalInput("featHeading");
  options.fixHeading = getOptionalInput("fixHeading");
  options.prefix = getOptionalInput("prefix");
  options.suffix = getOptionalInput("suffix");

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
