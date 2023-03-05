import { LogResult, SimpleGit } from "simple-git";
import { Options } from "../types/options";
import { Commit } from "../types/shared";
import { getLowercaseModule, getTagPrefix } from "./versioning";

export async function findPrevTag({
  git,
  options,
}: {
  git: SimpleGit;
  options: Options;
}): Promise<string | undefined> {
  const tags = (await git.tags()).all.reverse();
  console.error("Tags:", tags);
  const tagPrefix = getTagPrefix({ options });
  console.error(`Finding latest tag that starts with "${tagPrefix}"`);
  const prevTag = tags.find((tag) => tag.startsWith(tagPrefix));
  console.error(`Previous tag: ${prevTag}`);
  return prevTag;
}

export async function findRelevantCommits({
  git,
  prevTag,
  options,
}: {
  git: SimpleGit;
  prevTag: string | undefined;
  options: Options;
}) {
  let commits: LogResult;
  if (!prevTag) {
    console.error(`Getting all commits`);
    commits = await git.log();
  } else {
    console.error(`Getting commits since previous tag`);
    commits = await git.log({ from: prevTag, to: "HEAD" });
  }

  return (
    commits.all
      // Remove irrelevant commits
      .filter(filterCommits(options))
      // Order commits oldest to newest (the order they will show up on the changelog)
      .reverse()
  );
}

function filterCommits(options: Options) {
  let regex: RegExp;
  if (options.module) {
    const scopes = options.scopes ?? [getLowercaseModule(options.module)];
    regex = new RegExp(`^(feat!?|fix)\\((${scopes.join("|")})\\)`, "m");
  } else {
    regex = new RegExp(`^(feat!?|fix)`, "m");
  }
  return (log: Commit): boolean => {
    return regex.test(log.message);
  };
}
