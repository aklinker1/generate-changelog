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
  /**
   * An optional field for configuring how changes are listed in the changelog. This field is
   * templated via []`template.js`](https://pinjasaur.github.io/templater.js/). Read it's docs for
   * more info on creating templates.
   *
   * Variables available in the template:
   * - `{{ message }}`: the change's simple message, with type, scope, and additional lines stripped
   *   from the commit message.
   * - `{{ scope }}`: The scope of the change.
   * - `{{ commit.hash }}`: The change's commit hash.
   * - `{{ commit.message }}`: The entire commit message of the change.
   *
   * @default "- {{ #if (scope) }}**{{ scope }}:** {{ /if }}{{ message }} ({{ commit.hash }})"
   */
  changeTemplate?: string;
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
export const DEFAULT_CHANGE_TEMPLATE =
  "- {{ #if (scope) }}**{{ scope }}:** {{ /if }}{{ message }} ({{ commit.hash }})";
