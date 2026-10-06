# Contributing

Thanks for your interest in contributing to tahleel.

## Development Setup

This is a Bun monorepo managed with Turborepo.

```bash
bun install
bun run dev
```

Useful scripts:

```bash
bun run build        # build all packages and apps
bun run check        # run checks across the workspace
bun run check-types  # type-check all packages and apps
bun run fmt          # format with Prettier
```

## Making Changes

1. Fork the repository and create a branch from `main`.
2. Make your changes, keeping them focused and minimal.
3. Run `bun run check-types` and `bun run fmt` before opening a PR.
4. Open a pull request describing what changed and why.

## Commit Style

We use conventional-style commit messages, e.g.:

- `feat: add reminder notifications`
- `fix: correct friend link on offline state`

## Reporting Issues

For bugs, please open a GitHub issue with steps to reproduce.
For security vulnerabilities, see [SECURITY.md](./SECURITY.md) — do not open a public issue.

## License

By contributing, you agree that your contributions are licensed under the project's GPL-3.0 license.
