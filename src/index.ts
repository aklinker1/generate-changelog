import simpleGit, { SimpleGit } from "simple-git";
import {
  DEFAULT_BREAKING_CHANGE_HEADING,
  DEFAULT_FEAT_HEADING,
  DEFAULT_FIX_HEADING,
  Options,
} from "./types/options";
import { Changes, Commit } from "./types/shared";
import { findPrevTag, findRelevantCommits } from "./utils/git";
import {
  getNextVersion,
  getPrevVersion,
  getTagPrefix,
} from "./utils/versioning";

export async function generateChangelog(
  options: Options = {},
  git: SimpleGit = simpleGit()
) {
  console.log("Options:", options);

  const prevTag = await findPrevTag({ git, options });
  const prevVersion = getPrevVersion({ prevTag, options });
  const commits = await findRelevantCommits({ git, prevTag, options });
  const changes = parseChanges({ commits });
  const changelog = renderChangelog({ changes, options });
  const nextVersion = getNextVersion({ prevVersion, changes });
  const nextTag = getTagPrefix({ options }) + nextVersion;
  const skipped = prevVersion === nextVersion;

  const results = {
    skipped,
    changelog,
    prevTag,
    prevVersion,
    nextTag,
    nextVersion,
  };
  console.log("Results:", results);
  return results;
}

function parseChanges({ commits }: { commits: Commit[] }): Changes {
  const changes: Changes = {
    fixes: [],
    features: [],
    breakingChanges: [],
  };
  for (const commit of commits) {
    if (commit.message.startsWith("feat")) {
      const breakingChanges = getBreakingChanges(commit);
      changes.breakingChanges.push(...breakingChanges);
    }
    if (commit.message.startsWith("feat")) {
      changes.features.push(commit);
    } else {
      changes.fixes.push(commit);
    }
  }
  return changes;
}

function renderChangelog({
  changes,
  options,
}: {
  changes: Changes;
  options: Options;
}): string {
  const lines: string[] = [];
  if (options.prefix) lines.push(options.prefix.trim());

  if (changes.features.length > 0) {
    const featuresText = options.fixHeading ?? DEFAULT_FEAT_HEADING;
    lines.push(
      "",
      `### ${featuresText}`,
      "",
      ...changes.features.map(formatCommit)
    );
  }
  if (changes.fixes.length > 0) {
    const fixesText = options.fixHeading ?? DEFAULT_FIX_HEADING;
    lines.push("", `### ${fixesText}`, "", ...changes.fixes.map(formatCommit));
  }

  if (changes.breakingChanges.length > 0) {
    const breakingChangesText =
      options.breakingChangeHeading ?? DEFAULT_BREAKING_CHANGE_HEADING;
    lines.push(
      "",
      `### ${breakingChangesText}`,
      "",
      ...changes.breakingChanges.map(formatCommit)
    );
  }

  if (options.suffix) lines.push(options.suffix.trim());

  return lines.join("\n").trim();
}

function formatCommit(commit: Pick<Commit, "message" | "hash">): string {
  const scopeRegex = /.*\((.*?)\):\s*?(.*)/;
  const scopeMatch = scopeRegex.exec(commit.message);
  if (scopeMatch)
    return `- **${scopeMatch[1]}:** ${scopeMatch[2].trim()} (${commit.hash})`;

  const noScopeRegex = /.*?:\s*?(.*)/;
  const noScopeMatch = noScopeRegex.exec(commit.message);
  if (noScopeMatch) return `- ${noScopeMatch[1].trim()} (${commit.hash})`;

  throw Error("Could not parse commit: " + commit.message);
}

function getBreakingChanges(commit: Commit) {
  const changes: Pick<Commit, "message" | "hash">[] = [];
  if (commit.message.includes("!:")) changes.push(commit);
  commit.body.split("\n").forEach((line) => {
    if (line.startsWith("BREAKING CHANGE:"))
      changes.push({ message: line, hash: commit.hash });
  });
  return changes;
}
