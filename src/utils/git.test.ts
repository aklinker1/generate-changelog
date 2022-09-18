import { describe, expect, it } from "vitest";
import { Options } from "../types/options";
import { Commit } from "../types/shared";
import { findPrevTag, findRelevantCommits } from "./git";
import { findCommit, mockCommit, testGit } from "./testing";

describe("Git Utils", () => {
  describe("findPrevTag", () => {
    const git = () =>
      testGit({
        tags: [
          "module-b-v2.12.201",
          "module-a-v0.3.1",
          "v1.1.2",
          "module-a-v0.3.0",
          "module-b-v2.12.201",
          "v1.1.1",
        ],
      });

    it("should return the previous 'v{{version}}' tag when a module is NOT specified", async () => {
      const prevTag = await findPrevTag({
        options: {},
        git: git(),
      });
      expect(prevTag).toBe("v1.1.2");
    });

    it("should return the previous '{{module}}-v{{version}}' tag when a module is specified", async () => {
      const prevTag = await findPrevTag({
        options: { module: "Module A" },
        git: git(),
      });
      expect(prevTag).toBe("module-a-v0.3.1");
    });
  });

  describe("findRelevantCommits", () => {
    describe("Searching for commits", () => {
      it("should look at all commits when a previous tag is was no found", async () => {
        const git = testGit({});
        const prevTag = undefined;
        const options: Options = {};

        await findRelevantCommits({ git, prevTag, options });

        expect(git.log).toBeCalledTimes(1);
        expect(git.log).toBeCalledWith(/* nothing */);
      });

      it("should look at commits since the previous tag", async () => {
        const git = testGit({});
        const prevTag = "some-tag";
        const options: Options = {};

        await findRelevantCommits({ git, prevTag, options });

        expect(git.log).toBeCalledTimes(1);
        expect(git.log).toBeCalledWith({ from: prevTag, to: "HEAD" });
      });
    });

    describe("Filtering commits", () => {
      it("should return all fix/feat commits when a module is NOT specified", async () => {
        const commits: Commit[] = [
          mockCommit({ hash: "07", message: "chore:   message 07" }),
          mockCommit({ hash: "06", message: "ci:      message 06" }),
          mockCommit({ hash: "05", message: "docs:    message 05" }),
          mockCommit({ hash: "04", message: "release: message 04" }),
          mockCommit({ hash: "03", message: "feat!:   message 03" }),
          mockCommit({ hash: "02", message: "feat:    message 02" }),
          mockCommit({ hash: "01", message: "fix:     message 01" }),
        ];
        const git = testGit({ commits });
        const prevTag = undefined;
        const options: Options = {};
        const expected = [
          findCommit(commits, "01"),
          findCommit(commits, "02"),
          findCommit(commits, "03"),
        ];

        const actual = await findRelevantCommits({ git, prevTag, options });

        expect(actual).toEqual(expected);
      });

      describe("Module is passed", () => {
        const commits: Commit[] = [
          mockCommit({ hash: "21", message: "chore:      message 21" }),
          mockCommit({ hash: "20", message: "chore(b):   message 20" }),
          mockCommit({ hash: "19", message: "chore(a):   message 19" }),
          mockCommit({ hash: "18", message: "ci:         message 18" }),
          mockCommit({ hash: "17", message: "ci(b):      message 17" }),
          mockCommit({ hash: "16", message: "ci(a):      message 16" }),
          mockCommit({ hash: "15", message: "docs:       message 15" }),
          mockCommit({ hash: "14", message: "docs(b):    message 14" }),
          mockCommit({ hash: "13", message: "docs(a):    message 13" }),
          mockCommit({ hash: "12", message: "release:    message 12" }),
          mockCommit({ hash: "11", message: "release(b): message 11" }),
          mockCommit({ hash: "10", message: "release(a): message 10" }),
          mockCommit({ hash: "09", message: "feat!:      message 09" }),
          mockCommit({ hash: "08", message: "feat!(b):   message 08" }),
          mockCommit({ hash: "07", message: "feat!(a):   message 07" }),
          mockCommit({ hash: "06", message: "feat:       message 06" }),
          mockCommit({ hash: "05", message: "feat(b):    message 05" }),
          mockCommit({ hash: "04", message: "feat(a):    message 04" }),
          mockCommit({ hash: "03", message: "fix:        message 03" }),
          mockCommit({ hash: "02", message: "fix(b):     message 02" }),
          mockCommit({ hash: "01", message: "fix(a):     message 01" }),
        ];

        it("should return only the fix/feat commits with the specified module", async () => {
          const git = testGit({ commits });
          const prevTag = "a-v1.0.0";
          const options: Options = {
            module: "A",
          };
          const expected = [
            findCommit(commits, "01"),
            findCommit(commits, "04"),
            findCommit(commits, "07"),
          ];

          const actual = await findRelevantCommits({ git, prevTag, options });

          expect(actual).toEqual(expected);
        });

        it("should return only the fix/feat commits with the specified scopes", async () => {
          const git = testGit({ commits });
          const prevTag = "some-module-v1.0.0";
          const options: Options = {
            module: "Some Module",
            scopes: ["a"],
          };
          const expected = [
            findCommit(commits, "01"),
            findCommit(commits, "04"),
            findCommit(commits, "07"),
          ];

          const actual = await findRelevantCommits({ git, prevTag, options });

          expect(actual).toEqual(expected);
        });

        it("should return only the fix/feat commits with the specified scopes", async () => {
          const git = testGit({ commits });
          const prevTag = "some-module-v1.0.0";
          const options: Options = {
            module: "Some Module",
            scopes: ["a", "b"],
          };
          const expected = [
            findCommit(commits, "01"),
            findCommit(commits, "02"),
            findCommit(commits, "04"),
            findCommit(commits, "05"),
            findCommit(commits, "07"),
            findCommit(commits, "08"),
          ];

          const actual = await findRelevantCommits({ git, prevTag, options });

          expect(actual).toEqual(expected);
        });
      });
    });
  });
});
