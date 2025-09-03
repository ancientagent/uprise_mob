# CCMP Framework for UPRISE Mobile

## Overview
CCMP (Coordinator, Constraints, Plan, Measures) is a structured framework for AI agent collaboration on the UPRISE React Native mobile app.

## Framework Components

### Coordinator
- **Who/What**: Claude Code agents, CI/CD pipeline, GitHub Actions
- **Role**: Trigger and coordinate work based on user requirements and automated events
- **Integration**: Uses prompts from `/prompts/` directory for consistent task execution

### Constraints (UPRISE Guardrails)
**Critical Operating Constraints:**
- **Environment**: Windows non-admin PowerShell only
- **Paths**: User-writable locations only (no elevation, registry edits, global installs)
- **React Native**: Version 0.66.4 baseline compatibility
- **Build Tools**: Gradle 7.0.2 + JDK 11 (enforced for RN compatibility)
- **Metro**: Requires `NODE_OPTIONS=--openssl-legacy-provider` for bundling
- **Dependencies**: Always use `npm install --legacy-peer-deps`
- **Links**: No symlinks (Windows compatibility)
- **SDK**: Android SDK in user AppData, never system-wide

### Plan
- **Approach**: Phased, idempotent steps with clear success criteria  
- **Documentation**: All changes must update `uprise_docs/CHANGELOG.md`
- **Stability**: Stable changes also update `RUNBOOK_ANDROID.md`
- **Rollback**: Each step must be reversible without system impact

### Measures (Quality Gates)
**Automated Validation:**
- **APK Signing**: Release APK signature verification via `apksigner`
- **Size Guardrails**: Debug ≤120MB, Release ≤80MB (soft thresholds)
- **SDK Sanity**: Extract and validate `minSdkVersion`/`targetSdkVersion`
- **TTJS Performance**: Time-to-first-ReactNativeJS baseline metric
- **Smoke Assertions**: JS runtime + activity focus validation
- **Forensics**: Comprehensive diagnostics (logcat, bugreport, ANR/tombstones)

## Quick Start

1. **For Task Execution**: Paste prompts from `/prompts/*.md` into Cursor/Claude Code
2. **For Quality Validation**: Use checklists from `/checklists/*.md`
3. **For Framework Evolution**: Update this README and `.index.json`

## File Structure
```
.claude/
├── README.md              # This overview
├── .index.json           # Programmatic file index
├── prompts/              # Reusable task templates
│   ├── agent_task_template.md
│   └── ci_smoke_repair.md
└── checklists/           # Quality gate checklists
    └── ci_quality_gates.md
```

## Integration Points
- **GitHub Actions**: `.github/workflows/android-debug-build.yml`
- **Documentation**: `uprise_docs/CHANGELOG.md`, `uprise_docs/RUNBOOK_ANDROID.md`
- **Branch**: Primary work on `feat/ccmp-framework`