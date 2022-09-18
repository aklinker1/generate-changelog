import { SimpleGit } from "simple-git";
import { vi } from "vitest";
import { Commit } from "../types/shared";

/**
 * Return a mocked version of `simpleGit` that has a specific git history. Commits should be listed
 * newest &rarr; oldest.
 *
 * @example
 * const git = testGit({
 *   commits: [
 *     mockCommit({ message: "newest" }),
 *     mockCommit({ message: "oldest" }),
 *   ],
 *   tags: ["newest", "oldest"]
 * });
 */
export function testGit(history: {
  commits?: Commit[];
  tags?: string[];
}): SimpleGit {
  return {
    log: vi.fn().mockResolvedValue({ all: history.commits ?? [] }) as any,
    tags: vi
      .fn()
      // Tags are returned oldest -> newest, reverse what is passed into this method.
      .mockResolvedValue({ all: (history.tags ?? []).reverse() }) as any,
  } as SimpleGit;
}

export function mockCommit(override?: Partial<Commit>): Commit {
  const base: Commit = {
    author_email: "random-user@example.com",
    author_name: "Random User",
    message: "fix(api): some API work 2",
    body: "Some body",
    date: Date(),
    hash: String(Math.random() * 9999999),
    refs: "",
  };
  return { ...base, ...override };
}

export function findCommit(history: Commit[], hash: string) {
  return history.find((commit) => commit.hash === hash);
}
