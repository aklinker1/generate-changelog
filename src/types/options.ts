export interface ChangelogOptions {
  /**
   * An optional block of markdown that will be rendered above the changes.
   */
  prefix?: string;
  /**
   * An optional block of markdown that will be rendered after the changes.
   */
  suffix?: string;
  /**
   * The text used for the fixes section of the changelog.
   *
   * @default "Bug Fixes"
   */
  fixHeading?: string;
  /**
   * The text used for the features section of the changelog.
   *
   * @default "Features"
   */
  featHeading?: string;
  /**
   * The text used for the breaking changes section of the changelog.
   *
   * @default "BREAKING CHANGES"
   */
  breakingChangeHeading?: string;
}

export interface SingleProjectOptions extends ChangelogOptions {
  module?: undefined;
}

export interface MultiProjectOptions extends ChangelogOptions {
  /**
   * The name of the module that the release is for. If you only have a single project in your repo, exclude this field.
   */
  module: string;
  /**
   * A list of scopes that should be considered for this release.
   *
   * @default [module] Just the module that is being released.
   */
  scopes?: string[];
}

export type Options = SingleProjectOptions | MultiProjectOptions;

export const DEFAULT_BREAKING_CHANGE_HEADING = "BREAKING CHANGES";
export const DEFAULT_FEAT_HEADING = "Features";
export const DEFAULT_FIX_HEADING = "Bug Fixes";
