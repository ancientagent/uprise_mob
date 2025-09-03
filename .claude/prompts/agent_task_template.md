# Agent Task Template

Use this template for structured AI agent tasks on UPRISE Mobile.

## Context
**Repository**: UPRISE Mobile App (React Native 0.66.4)
**Branch**: feat/ccmp-framework  
**Environment**: Windows non-admin PowerShell, user-writable paths only

## Guardrails (MUST FOLLOW)
- **No Elevation**: No admin privileges, registry edits, or global installs
- **User-Writable Only**: All operations in user AppData or project directories
- **No Symlinks**: Windows compatibility requirement
- **RN 0.66.4 Baseline**: Gradle 7.0.2 + JDK 11 compatibility
- **Metro Legacy**: Always `NODE_OPTIONS=--openssl-legacy-provider`
- **Dependencies**: Always `npm install --legacy-peer-deps`
- **Android SDK**: User-local installation only
- **CI Safety**: Changes must not break existing CI pipeline

## Objective
**Single, Testable Outcome**: [STATE YOUR SPECIFIC GOAL HERE]

## Steps (Idempotent)
1. **Verification**: Check current state before making changes
2. **Edit Phase**: Make necessary code/config modifications
3. **Command Phase**: Execute required build/test commands
4. **Validation**: Verify objective was achieved
5. **Rollback Plan**: Document how to reverse changes if needed

## Anti-Hang Clause
If any command is idle >120 seconds without output:
- Stop execution immediately
- Print last 200 lines of output/logs
- Report partial progress and specific blocking point

## Doc-Update Rule
**Always Required**:
- Append entry to `uprise_docs/CHANGELOG.md` with date/time and impact

**For Stable Changes**:
- Also update relevant sections in `uprise_docs/RUNBOOK_ANDROID.md`

## Success Criteria (Objective Metrics)
- [ ] [SPECIFIC MEASURABLE OUTCOME 1]
- [ ] [SPECIFIC MEASURABLE OUTCOME 2]
- [ ] Documentation updated
- [ ] No regression in existing functionality
- [ ] CI pipeline remains green (or improves)

## Example Usage
Replace bracketed placeholders with task-specific details. Copy/paste into Claude Code for execution.