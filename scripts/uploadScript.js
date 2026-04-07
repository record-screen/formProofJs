#!/usr/bin/env node
/**
 * Upload script to Convex
 *
 * Usage:
 *   node scripts/uploadScript.js <environment> [--activate]
 *
 * Examples:
 *   node scripts/uploadScript.js staging
 *   node scripts/uploadScript.js production --activate
 *
 * Environment variables:
 *   CONVEX_URL - Convex deployment URL (required)
 */

import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from package.json
const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));
const version = pkg.version;

// Parse arguments
const args = process.argv.slice(2);
const environment = args[0];
const shouldActivate = args.includes("--activate");

if (!environment || !["staging", "production", "develop"].includes(environment)) {
    console.error("Usage: node scripts/uploadScript.js <staging|production|develop> [--activate]");
    process.exit(1);
}

// Convex URL - get from environment or use default
const CONVEX_URL = process.env.CONVEX_URL || process.env.PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
    console.error("Error: CONVEX_URL environment variable is required");
    console.error("Set it to your Convex deployment URL (e.g., https://xxx.convex.cloud)");
    process.exit(1);
}

// Read the compiled script (minified version)
const scriptPath = join(__dirname, `../dist/formtrace-${environment}.js`);
let scriptContent;
try {
    scriptContent = readFileSync(scriptPath, "utf-8");
} catch (error) {
    console.error(`Error: Could not read ${scriptPath}`);
    console.error("Make sure you've run the build first: npm run build" + environment.charAt(0).toUpperCase() + environment.slice(1));
    process.exit(1);
}

console.log(`Uploading formtrace v${version} for ${environment}...`);
console.log(`Script size: ${(scriptContent.length / 1024).toFixed(2)} KB`);

// Upload to Convex
const client = new ConvexHttpClient(CONVEX_URL);

try {
    // Upload the script
    const scriptId = await client.mutation("scripts:uploadScript", {
        environment,
        version,
        content: scriptContent,
        isActive: shouldActivate,
    });

    console.log(`✓ Uploaded successfully (ID: ${scriptId})`);

    if (shouldActivate) {
        console.log(`✓ Version ${version} is now active for ${environment}`);
    } else {
        console.log(`Note: Script uploaded but not active. Use --activate flag or run:`);
        console.log(`  node scripts/activateScript.js ${environment} ${version}`);
    }

} catch (error) {
    console.error("Error uploading to Convex:", error.message);
    process.exit(1);
}
