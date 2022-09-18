import { test, expect } from "vitest";
import { generateChangelog } from ".";
import { Options } from "./types/options";
import { Commit } from "./types/shared";
import { mockCommit, testGit } from "./utils/testing";

test("Example Server Changelog", async () => {
  const options: Options = {
    module: "Server",
    scopes: ["api", "ui"],
    prefix: "Download via Docker Hub",
  };
  const commits: Commit[] = [
    mockCommit({
      hash: "7890",
      message: "fix(api): some API work 2",
    }),
    mockCommit({
      hash: "6789",
      message: "chore(api): some API chore",
    }),
    mockCommit({
      hash: "5678",
      message: "release: cli-v0.5.0",
    }),
    mockCommit({
      hash: "4567",
      message: "fix(cli): Some CLI work",
    }),
    mockCommit({
      hash: "3456",
      message: "feat(ui): Some UI work 2",
    }),
    mockCommit({
      hash: "2345",
      message: "fix(ui): Some UI work 1",
    }),
    mockCommit({
      hash: "1234",
      message: "fix(api): Some API work 1",
    }),
  ];
  const tags = ["cli-v0.5.0", "server-v1.1.1", "server-v1.0.4"];
  const git = testGit({ commits, tags });

  const output = await generateChangelog(options, git);
  expect(output).toEqual({
    prevVersion: "1.1.1",
    prevTag: "server-v1.1.1",
    nextVersion: "1.2.0",
    nextTag: "server-v1.2.0",
    skipped: false,
    changelog: `
Download via Docker Hub

### Features

- **ui:** Some UI work 2 (3456)

### Bug Fixes

- **api:** Some API work 1 (1234)
- **ui:** Some UI work 1 (2345)
- **api:** some API work 2 (7890)
`.trim(),
  });
});

test("Example CLI changelog", async () => {
  const options: Options = {
    module: "CLI",
  };
  const commits: Commit[] = [
    mockCommit({
      hash: "4567",
      message: "feat(cli): Some CLI change 3",
    }),
    mockCommit({
      hash: "3456",
      message: "fix(cli): Some CLI change 2",
    }),
    mockCommit({
      hash: "2345",
      message: "fix(ui): Some UI change",
    }),
    mockCommit({
      hash: "1234",
      message: "feat(cli): Some CLI change 1",
    }),
  ];
  const tags = ["server-v2.0.0"];
  const git = testGit({ commits, tags });

  const output = await generateChangelog(options, git);
  expect(output).toEqual({
    prevVersion: undefined,
    prevTag: undefined,
    nextVersion: "1.0.0",
    nextTag: "cli-v1.0.0",
    skipped: false,
    changelog: `
### Features

- **cli:** Some CLI change 1 (1234)
- **cli:** Some CLI change 3 (4567)

### Bug Fixes

- **cli:** Some CLI change 2 (3456)
`.trim(),
  });
});

test("Breaking changes show up correctly", async () => {
  const options: Options = {};
  const commits: Commit[] = [
    mockCommit({
      hash: "3456",
      message: "fix: Some bug fix",
    }),
    mockCommit({
      hash: "2345",
      message: "feat!: Feature 2",
    }),
    mockCommit({
      hash: "1234",
      message: "feat: Feature 1",
      body: "BREAKING CHANGE: Breaking change 1\nBREAKING CHANGE: Breaking change 2",
    }),
  ];
  const git = testGit({ commits });

  const output = await generateChangelog(options, git);
  expect(output).toEqual({
    prevVersion: undefined,
    prevTag: undefined,
    nextVersion: "1.0.0",
    nextTag: "v1.0.0",
    skipped: false,
    changelog: `
### Features

- Feature 1 (1234)
- Feature 2 (2345)

### Bug Fixes

- Some bug fix (3456)

### BREAKING CHANGES

- Breaking change 1 (1234)
- Breaking change 2 (1234)
- Feature 2 (2345)
`.trim(),
  });
});
