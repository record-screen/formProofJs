# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FormTrace (internally called liveprintJs) is a JavaScript library for recording user interactions on web forms using rrweb. It captures form submissions, provides optional 2FA validation via Twilio, and supports phone blacklist verification. The library is designed to work with both standard HTML forms and ASP.NET WebForms (`__doPostBack`).

## Build Commands

```bash
# Build for staging environment
npm run buildStaging

# Build for production environment
npm run buildProduction

# Watch mode for local development (uses localMarco API)
gulp watch

# Build blacklist phone standalone module
gulp buildBlackList
```

## Architecture

### Build System
The project uses Gulp to concatenate source files and inject environment-specific API URLs. Each build produces four output files:
- `formtrace-{env}.js` - Minified version
- `formtrace-{env}-concat.js` - Readable concatenated version
- Versioned backups of both files

The build replaces `base_api_value` placeholder with the actual API endpoint and `__VERSION__` with the version from package.json.

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
- `debug` - Enable debug logging (boolean)
- `guide` - Provider/guide identifier for partial recordings
- `redirectId` - ID of hidden input containing redirect URL

### Form Submission Modes

1. **Organic mode** (default) - Fire-and-forget saving with `keepalive: true`, form submits immediately
2. **EPD mode** (`epd=true`) - Blocks submission, saves recording, then resumes form submit
3. **TFA/Blacklist mode** - Blocks submission for user validation before proceeding

### API Environments

Defined in `gulpfile.js`:
- `local` - Development
- `staging` - Staging environment
- `production` - Production environment
- `localMarco` - Developer-specific testing

## Key Implementation Details

- Uses `rrweb.record()` for DOM replay recording
- ASP.NET WebForms compatibility via `__doPostBack` interception and late hook via `Object.defineProperty`
- Client IP fetched from ipify.org API
- Large payloads (>60KB) use XMLHttpRequest instead of fetch with keepalive
- Falls back to `navigator.sendBeacon` if fetch fails
- Phone validation regex: US numbers with optional +1 prefix
