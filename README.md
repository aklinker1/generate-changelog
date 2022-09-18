# Generate Changelog 

A tool that generates a changelog and next version based on your commit history. It follows some of the basic conventional commit standards for bumping versions, but it is not a complete implementation of that standard.

This does not change the version or commit or tag anything. It just calculates the changelog and the next version information.

## Features

- Automatic version bumping via `fix`/`feat`/`BREAKING CHANGE`
- Support multiple projects in a single repo via scopes (`fix(api): some api bug fix`)

## Changelog Examples

With the following commits, you would see the following changelog:

```text
5555555
feat!: Remove `config.abc`

4444444
feat!: Feat 2 was implemented

BREAKING CHANGE: The `config.xyz` not longer has any effect

3333333
fix: Bug 2 was fixed

2222222
feat: Feat 1 was implemented

1111111
fix: Bug 1 was fixed
```

<details>
<summary>Resulting Changlog</sumamry>

> ### Features
> 
> - Feat 1 was implemented
> - Feat 2 was implemented
> - Remove `config.abc`
> 
> ### Bug Fixes
>
> - Bug 1 was fixed
> - Bug 2 was fixed
> 
> ### BREAKING CHANGES
> 
> - The `config.xyz` not longer has any effect
> - Remove `config.abc`

</details>

## Usage

See [`src/types/options.ts`](./src/types/options.ts) for a list of all options that can be used to configure how the changelog is generated.

### Node API

```ts
import { generateChangelog } from '@aklinker1/generate-changelog';

generateChangelog({
    // ...
})
```

### CLI

Use the `generate-changelog` command to output version and changelog details. the final JSON ouputs are logged to stderr for you to parse and consume.

```bash
generate-changelog [options] [dir]
```

See `generate-changelog --help` for options and usage.
