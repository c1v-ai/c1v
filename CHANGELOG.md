# Changelog

All notable changes to the C1V project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo setup with Turborepo and PNPM workspaces
- Root configuration files (package.json, turbo.json, pnpm-workspace.yaml)
- Agent instruction architecture (.claude/instructions.md)
- GitHub Actions workflows for testing, documentation, and releases
- Documentation standards and templates

### Changed
- N/A

### Fixed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Security
- N/A

## [0.1.0] - 2026-01-12

### Added
- Project initialization
- Basic monorepo structure

---

## Guidelines for Changelog

### Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

### Format
```markdown
### Added
- Brief description of change ([#PR](link-to-pr)) by @username
- Support for new feature X

### Fixed
- Fix for bug Y ([#123](link-to-issue))
```

### When to Update
- **Every PR**: Add entry under `[Unreleased]` section
- **On Release**: Version number replaces `[Unreleased]` header
- **Skip for**: Documentation-only, dependency updates (use `skip-changelog` label)
