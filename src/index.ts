import simpleGit, { SimpleGit } from "simple-git";
import {
  DEFAULT_BREAKING_CHANGE_HEADING,
  DEFAULT_CHANGE_TEMPLATE,
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
import templater from "templater.js";

export async function generateChangelog(
  options: Options = {},
  git: SimpleGit = simpleGit()
) {
  console.error("Options:", options);

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
  console.error("Results:", results);
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
      ...changes.features.map(formatCommit(options))
    );
  }
  if (changes.fixes.length > 0) {
    const fixesText = options.fixHeading ?? DEFAULT_FIX_HEADING;
    lines.push(
      "",
      `### ${fixesText}`,
      "",
      ...changes.fixes.map(formatCommit(options))
    );
  }

  if (changes.breakingChanges.length > 0) {
    const breakingChangesText =
      options.breakingChangeHeading ?? DEFAULT_BREAKING_CHANGE_HEADING;
    lines.push(
      "",
      `### ${breakingChangesText}`,
      "",
      ...changes.breakingChanges.map(formatCommit(options))
    );
  }

  if (options.suffix) lines.push(options.suffix.trim());

  return lines.join("\n").trim();
}

function formatCommit({
  changeTemplate,
}: {
  changeTemplate?: string;
}): (commit: Commit) => string {
  const template = templater(changeTemplate ?? DEFAULT_CHANGE_TEMPLATE);

  return (commit) => {
    let scope: string | undefined;
    let message: string;

    const scopeRegex = /.*\((.*?)\):\s*?(.*)/;
    const scopeMatch = scopeRegex.exec(commit.message);

    const noScopeRegex = /.*?:\s*?(.*)/;
    const noScopeMatch = noScopeRegex.exec(commit.message);

    if (scopeMatch) {
      scope = scopeMatch[1];
      message = scopeMatch[2].trim();
    } else if (noScopeMatch) {
      message = noScopeMatch[1].trim();
    } else {
      throw Error("Could not parse commit: " + commit.message);
    }

    return template({ message, scope, commit });
  };
}

function getBreakingChanges(commit: Commit) {
  const changes: Commit[] = [];
  if (commit.message.includes("!:")) changes.push(commit);
  commit.body.split("\n").forEach((line) => {
    if (line.startsWith("BREAKING CHANGE:"))
      changes.push({ ...commit, message: line });
  });
  return changes;
}
