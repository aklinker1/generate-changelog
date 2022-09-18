import { describe, expect, it } from "vitest";
import { Options } from "../types/options";
import { Changes } from "../types/shared";
import { mockCommit } from "./testing";
import {
  getLowercaseModule,
  getNextVersion,
  getPrevVersion,
  getTagPrefix,
} from "./versioning";

describe("Versioning Utils", () => {
  describe("getLowercaseModule", () => {
    it.each([
      ["API", "api"],
      ["Web", "web"],
      ["Some Module", "some-module"],
      ["SomeModule", "somemodule"],
      ["some-module", "some-module"],
      ["SOME_MODULE", "some_module"],
    ])("should transform '%s' -> '%s' (%#)", (module, expected) => {
      expect(getLowercaseModule(module)).toBe(expected);
    });
  });

  describe("getTagPrefix", () => {
    it.each<[Options, string]>([
      [{}, "v"],
      [{ module: "API" }, "api-v"],
      [{ module: "Some Module" }, "some-module-v"],
    ])("should transform '%j' -> '%s' (%#)", (options, expected) => {
      expect(getTagPrefix({ options })).toBe(expected);
    });
  });

  describe("getPrevVersion", () => {
    it.each<[string, string, Options]>([
      ["1.0.0", "v1.0.0", {}],
      ["1.0.0", "a-v1.0.0", { module: "A" }],
    ])(
      "should return %s from prevTag=%s and options=%j",
      (expected, prevTag, options) => {
        expect(getPrevVersion({ options, prevTag })).toBe(expected);
      }
    );
  });

  describe("getNextVersion", () => {
    it.each([
      ["1.0.0", "2.0.0"],
      ["2.1.0", "3.0.0"],
      ["3.2.1", "4.0.0"],
    ])(
      "should bump the major version when there's a breaking change (%s -> %s)",
      (prevVersion, expected) => {
        const changes: Changes = {
          breakingChanges: [mockCommit()],
          features: [mockCommit(), mockCommit()],
          fixes: [mockCommit()],
        };
        expect(getNextVersion({ prevVersion, changes })).toBe(expected);
      }
    );

    it.each([
      ["0.0.0", "0.1.0"],
      ["1.0.0", "1.1.0"],
      ["2.1.0", "2.2.0"],
      ["3.2.1", "3.3.0"],
    ])(
      "should bump the minor version when there's a feature (%s -> %s)",
      (prevVersion, expected) => {
        const changes: Changes = {
          breakingChanges: [],
          features: [mockCommit(), mockCommit()],
          fixes: [mockCommit()],
        };
        expect(getNextVersion({ prevVersion, changes })).toBe(expected);
      }
    );

    it.each([
      ["0.0.0", "0.0.1"],
      ["1.0.0", "1.0.1"],
      ["2.1.0", "2.1.1"],
      ["3.2.1", "3.2.2"],
    ])(
      "should bump the patch version when there's a fix (%s -> %s)",
      (prevVersion, expected) => {
        const changes: Changes = {
          breakingChanges: [],
          features: [],
          fixes: [mockCommit(), mockCommit(), mockCommit()],
        };
        expect(getNextVersion({ prevVersion, changes })).toBe(expected);
      }
    );

    it.each(["0.0.0", "1.0.0", "2.1.0", "3.2.1"])(
      "should not change the version when there's no changes (%s -> %s)",
      (prevVersion) => {
        const changes: Changes = {
          breakingChanges: [],
          features: [],
          fixes: [],
        };
        expect(getNextVersion({ prevVersion, changes })).toBe(prevVersion);
      }
    );
  });
});
