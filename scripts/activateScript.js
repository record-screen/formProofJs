#!/usr/bin/env node
/**
 * Activate a script version in Convex
 *
 * Usage:
 *   node scripts/activateScript.js <environment> <version>
 *
 * Examples:
 *   node scripts/activateScript.js staging 1.2.9
 *   node scripts/activateScript.js production 1.3.0
 *
 * Environment variables:
 *   CONVEX_URL - Convex deployment URL (required)
 */

import { ConvexHttpClient } from "convex/browser";

// Parse arguments
const args = process.argv.slice(2);
const environment = args[0];
const version = args[1];

if (!environment || !version) {
    console.error("Usage: node scripts/activateScript.js <staging|production|develop> <version>");
    process.exit(1);
}

if (!["staging", "production", "develop"].includes(environment)) {
    console.error("Error: environment must be staging, production, or develop");
    process.exit(1);
}

// Convex URL
const CONVEX_URL = process.env.CONVEX_URL || process.env.PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
    console.error("Error: CONVEX_URL environment variable is required");
    process.exit(1);
}

console.log(`Activating version ${version} for ${environment}...`);

const client = new ConvexHttpClient(CONVEX_URL);

try {
    await client.mutation("scripts:setActiveVersion", {
        environment,
        version,
    });

    console.log(`✓ Version ${version} is now active for ${environment}`);

} catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
}
