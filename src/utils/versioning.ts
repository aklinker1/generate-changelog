import { Options } from "../types/options";
import { Changes } from "../types/shared";

export function getLowercaseModule(module: string): string {
  return module.toLowerCase().replace(/\s/gm, "-");
}

export function getTagPrefix({ options }: { options: Options }): string {
  if (options.module) return `${getLowercaseModule(options.module)}-v`;
  return "v";
}

export function getPrevVersion({
  prevTag,
  options,
}: {
  prevTag: string | undefined;
  options: Options;
}) {
  return prevTag?.replace(getTagPrefix({ options }), "");
}

export function getNextVersion({
  prevVersion,
  changes,
}: {
  prevVersion?: string;
  changes: Changes;
}): string {
  if (!prevVersion) {
    console.log("No previous tag, using 1.0.0");
    return "1.0.0";
  }

  let [major, minor, patch] = prevVersion.split(".").map(Number);
  console.log(`Previous version: ${major}.${minor}.${patch}`);

  if (changes.breakingChanges.length > 0) {
    major++;
    minor = 0;
    patch = 0;
  } else if (changes.features.length > 0) {
    minor++;
    patch = 0;
  } else if (changes.fixes.length > 0) {
    patch++;
  }
  return `${major}.${minor}.${patch}`;
}
