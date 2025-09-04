# CLAUDE Configuration for UPRISE Mobile App

## Repository Information
- **Name**: UPRISE Mobile App
- **Repository**: https://github.com/ancientagent/uprise_mob.git
- **Default Branch**: main
- **Technology Stack**: React Native 0.66.4, Android, Gradle 7.0.2, JDK 11

## CCPM Framework Integration
This repository uses the CCPM (Claude Project Management) framework for structured AI agent collaboration.

### Quick Setup Commands
```bash
# One-time initialization
/pm:init

# Create and manage epics
/pm:prd-new <name> → /pm:prd-parse <name> → /pm:epic-oneshot <name>

# Manage individual work
/pm:issue-start <id> → /pm:issue-sync <id> → /pm:next
```

## Critical Guardrails

### Permissions & Security
**ALL WORK MUST OPERATE IN NON-ADMIN POWERSHELL, USE USER-WRITABLE PATHS, NO SYMLINKS, NO GLOBAL INSTALLS, NO REGISTRY EDITS.**

If a step would require elevation or machine-global state, **STOP** and propose a CI-based alternative.

### Build Environment
- **Gradle**: 7.0.2 (enforced for RN 0.66 compatibility)
- **JDK**: 11 (Temurin/Eclipse Adoptium)
- **Android SDK**: User-local installation only
- **Node.js**: 18+ with legacy OpenSSL support

### CI/CD Requirements
- All builds must work in GitHub Actions CI environment
- No local-only dependencies or configurations
- Use secrets for sensitive data (Firebase, keystores)
- Maintain reproducible builds

## Documentation Update Rule
**ALL CHANGES MUST UPDATE `uprise_docs/CHANGELOG.md`** with:
- Date and time of change
- Description of what was changed
- Impact on build process or development workflow
- Any new commands or procedures added

## Project Structure
```
.claude/           # CCPM framework files
├── config/        # Configuration files
├── workflows/     # Workflow definitions
└── prompts/       # Agent prompts

uprise_docs/       # Project documentation
├── CHANGELOG.md   # Change tracking (MUST UPDATE)
├── RUNBOOK_ANDROID.md  # Android development guide
└── Agent-HQ/      # AI agent documentation
    └── CCPM-Usage.md   # Command reference
```

## Current Status
- **Branch**: android/first-launch-hermes-disable-trackplayer
- **Track-Player**: Temporarily disabled (TEMP DISABLE markers)
- **CI Pipeline**: Operational with Android debug builds
- **Metro**: Requires legacy OpenSSL support

## Next Steps
1. Complete CCPM framework setup
2. Create pilot epic for Android CI reliability
3. Re-enable track-player with proper fallbacks
4. Validate all changes in CI environment

## Jules Rules Integration
- Always verify current state before making changes
- Use command-line tools for definitive verification
- Follow top-down debugging approach for system issues
- Document all changes in appropriate files
