# Agent HQ Playbook - UPRISE Mobile

**Repository**: uprise_mob  
**Last Updated**: 2025-09-01 20:00 UTC  
**Version**: 1.0

## Allowed Scopes

### ✅ **Permitted Agent Activities**
- **CI/CD Files**: `.github/workflows/*.yml` modifications and optimizations
- **CI Scripts**: `ci/**/*.ps1`, `scripts/**/*.ps1` automation and tooling
- **Documentation**: `uprise_docs/**/*.md`, `README.md`, `CHANGELOG.md` updates
- **Configuration**: `package.json`, `gradle.properties`, `metro.config.js` optimizations
- **Build Tools**: Gradle wrapper, build scripts, dependency management
- **Monitoring**: Performance metrics, build analytics, artifact tracking

### ❌ **Restricted Agent Activities**
- **Application Code**: `src/**/*.js`, `App.js`, React Native components
- **Native Code**: `android/app/src/**/*.java`, `ios/**/*.swift`
- **Business Logic**: Service implementations, state management, API integrations
- **UI Components**: Screen components, navigation, styling
- **Core Features**: Authentication, data persistence, user workflows

## CI Guardrails

### **Android Build Requirements**
- **cmdline-tools**: Must use r8 (8092744) for SDK XML v2 compatibility
- **build-tools**: Pinned to 31.0.0 across all jobs for consistency
- **JDK Split**: sdkmanager uses JDK 17, Gradle uses JDK 11 (RN 0.66.x)
- **Watchdogs**: All long-running operations must have timeout and retry logic
- **Ubuntu Smoke**: Required gate - must pass for any deployment
- **macOS HVF**: Optional R&D - use `continue-on-error: true` if present

### **Artifact Management**
- **Debug APK**: Always generated and uploaded as `app-debug-apk`
- **Release APK**: Signed and uploaded as `app-release-apk`
- **Smoke Logs**: Comprehensive logs uploaded as `smoke-logs`
- **Summary Data**: JSON summary with metrics uploaded as `summary`
- **Retention**: 14 days for all artifacts

### **Quality Gates**
- **APK Signing**: Release APK must be properly signed and verifiable
- **Size Limits**: Debug <120MB, Release <80MB (soft limits with warnings)
- **SDK Validation**: minSdk=21, targetSdk=31 extraction and verification
- **TTJS Performance**: Time-to-first-ReactNativeJS measurement and reporting

## Branch Naming Convention

### **Format**: `ci/<area>-<short-description>`
- **Examples**:
  - `ci/android-optimize-gradle-cache`
  - `ci/smoke-add-macos-hvf-job`
  - `ci/docs-auto-changelog-updates`
  - `ci/security-add-secret-scanning`
  - `ci/performance-build-time-monitoring`

### **Branch Protection**
- **Required**: PR review from repository owner
- **Required**: CI smoke test must pass
- **Required**: No merge conflicts
- **Optional**: Status checks for documentation updates

## PR Template Checklist

### **CI Pipeline Changes**
- [ ] **r8 sdkmanager path**: Uses cmdline-tools r8 (8092744) for SDK XML v2
- [ ] **build-tools=31.0.0 only**: No other build-tools versions specified
- [ ] **emulator package installed**: API 30 google_apis x86_64 confirmed
- [ ] **ADB serial pinned + known ports**: ADB hygiene and connection stability
- [ ] **watchdogs present**: Timeout and retry logic for all long operations
- [ ] **Ubuntu smoke uploads summary.json**: Required gate with metrics
- [ ] **macOS job continue-on-error=true**: If present, must not block pipeline

### **Documentation Changes**
- [ ] **CHANGELOG.md updated**: Entry added with date, description, and impact
- [ ] **RUNBOOK_ANDROID.md updated**: If applicable, relevant sections updated
- [ ] **README.md current**: If modified, reflects latest changes
- [ ] **Agent playbook compliance**: Changes align with allowed scopes

### **Configuration Changes**
- [ ] **Backward compatibility**: Changes don't break existing builds
- [ ] **Performance impact**: No degradation in build times or resource usage
- [ ] **Security review**: No sensitive data exposed or credentials hardcoded
- [ ] **Testing validation**: Changes tested in CI environment

## Agent Coordination

### **Primary Agents**
- **devops-engineer**: CI/CD pipeline optimization and automation
- **deployment-engineer**: Release automation and artifact management
- **build-engineer**: Gradle optimization and build performance
- **security-auditor**: Security scanning and compliance validation
- **documentation-engineer**: Documentation automation and maintenance

### **Secondary Agents**
- **performance-engineer**: Performance monitoring and optimization
- **dependency-manager**: Package management and security updates
- **git-workflow-manager**: Git workflows and automation

### **Communication Protocol**
- **Daily Standup**: Agent status updates via GitHub Issues
- **Weekly Review**: Performance metrics and optimization opportunities
- **Incident Response**: Immediate coordination for CI failures
- **Knowledge Sharing**: Documentation updates and best practices

## Success Metrics

### **CI Performance**
- **Build Time**: Target <10 minutes (current: ~15 minutes)
- **Smoke Test Success**: Target >95% (current: ~90%)
- **Artifact Generation**: 100% success rate for debug/release APKs
- **Documentation Coverage**: 100% of CI processes documented

### **Quality Gates**
- **Security**: Zero critical vulnerabilities in dependencies
- **Performance**: TTJS <5 seconds, APK sizes within limits
- **Reliability**: <5% CI failure rate, <30 minute MTTR
- **Automation**: >90% of manual tasks automated

## Emergency Procedures

### **CI Pipeline Failure**
1. **Immediate**: Check GitHub Actions status and error logs
2. **Assessment**: Identify if issue is in build, smoke test, or artifact upload
3. **Response**: Apply hotfix or rollback to last known good state
4. **Communication**: Update team via GitHub Issues with status
5. **Post-mortem**: Document root cause and prevention measures

### **Agent Conflict Resolution**
1. **Identify**: Conflicting changes or overlapping responsibilities
2. **Coordinate**: Direct communication between affected agents
3. **Escalate**: Repository owner arbitration if needed
4. **Document**: Update playbook with resolution and prevention

### **Security Incident**
1. **Immediate**: Stop all CI/CD activities
2. **Assessment**: Evaluate scope and impact of security issue
3. **Containment**: Isolate affected systems and revoke access
4. **Recovery**: Implement fixes and restore secure operations
5. **Review**: Update security procedures and agent permissions

---

*This playbook ensures safe, coordinated agent operations while maintaining CI/CD excellence and system reliability.*
