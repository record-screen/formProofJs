# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FormTrace (internally called liveprintJs) is a JavaScript library for recording user interactions on web forms using rrweb. It captures form submissions, provides optional 2FA validation via Twilio, and supports phone blacklist verification. The library is designed to work with both standard HTML forms and ASP.NET WebForms (`__doPostBack`).

## Build Commands

```bash
# Build for specific environments
npm run buildStaging      # Staging environment
npm run buildProduction   # Production environment
npm run buildDevelop      # Develop environment

# Watch mode for local development (uses localMarco API)
gulp watch

# Build blacklist phone standalone module
gulp buildBlackList
```

## Deployment

CI/CD workflows in `.github/workflows/` auto-deploy when pushing to branches:
- `staging` → builds and commits to `dist/` with staging API
- `develop` → builds and commits to `dist/` with develop API
- `production` → builds and commits to `dist/` with production API

Each workflow: checkout → npm install → build → commit dist/ files → push.

## Architecture

### Build System
Gulp concatenates source files and injects environment-specific API URLs. Each build produces:
- `formtrace-{env}.js` - Minified version
- `formtrace-{env}-concat.js` - Readable concatenated version
- Versioned backups of both (`-v{version}.js`)

Build replaces `base_api_value` with API endpoint and `__VERSION__` with version from package.json.

### Source Files (concatenation order matters)

1. **rrweb** (from node_modules) - Screen recording library
2. **src/formtrace.js** - Main entry point and form submission handling
3. **src/tfaValidation.js** - Two-factor authentication modal flow
4. **src/saveRecording.js** - Recording save wrapper
5. **src/blackListPhone.js** - Phone blacklist validation flow
6. **src/utils/** - API call functions (send2faCode, validate2faCode, verifyPhoneBlackListApi, saveRecordings)

### Script Configuration

The script reads configuration from URL parameters on the `<script>` tag with `id="formproofScript"`:
- `token` - Client authentication token
- `phoneInputId` - ID of the phone input element
- `tfaTwilio` - Enable Twilio 2FA (boolean)
- `blackList` - Enable phone blacklist checking (boolean)
- `epd` - Enable "prevent default" mode - blocks form, saves, then resumes (boolean)
- `esp` - Enable "stop propagation" (boolean)
- `debug` - Enable debug logging with alerts and console output (boolean)
- `guide` - Provider/guide identifier for partial recordings
- `redirectId` - ID of hidden input containing redirect URL
- `privacityId` - ID of element containing terms/privacy text to capture

### Form Submission Modes

1. **Organic mode** (default) - Fire-and-forget saving with `keepalive: true`, form submits immediately
2. **EPD mode** (`epd=true`) - Blocks submission, saves recording, then resumes form submit via `resumeFormSubmit()`
3. **TFA/Blacklist mode** - Blocks submission for user validation before proceeding

### Recording Status Values

- `"completed"` - Standard full recording
- `"partial"` - Recording from a guide/provider (coreg flow)
- `"partial-followMe"` - Recording with redirect configured

### API Environments

Defined in `gulpfile.js`:
- `local` - `http://localhost:3020/api`
- `staging` - `https://formtrace-api-staging.aurionx.ai/api`
- `develop` - `https://formtrace-api-develop.aurionx.ai/api`
- `production` - `https://formtrace-api.aurionx.ai/api`
- `localMarco` - Developer-specific testing endpoint

## Key Implementation Details

- Uses `rrweb.record()` for DOM replay recording with `recordCanvas: true`
- ASP.NET WebForms compatibility via `__doPostBack` interception and late hook via `Object.defineProperty`
- Client IP fetched from ipify.org API (with 2s timeout in EPD mode)
- Large payloads (>60KB) use XMLHttpRequest instead of fetch with keepalive (keepalive limit ~64KB)
- Falls back to `navigator.sendBeacon` if fetch fails (for small payloads only)
- Phone validation regex: US numbers with optional +1 prefix
- ASP.NET form validation checked via `WebForm_OnSubmit()` or `Page_ClientValidate()` before saving
- `_formtraceProcessing` flag prevents duplicate processing during submit
- Debug mode (`debug=true`) shows detailed alerts and console logs prefixed with `formTrace#`
