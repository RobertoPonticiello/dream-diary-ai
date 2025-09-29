import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env files from a few likely locations to be resilient to cwd differences
function getRuntimeDir() {
  // Works in ESM (import.meta.url) and falls back to __dirname in CJS
  try {
      // ESM path resolution
      const meta = import.meta as unknown as { url: string };
      const __filename = fileURLToPath(meta.url);
    return path.dirname(__filename);
  } catch {
      // CJS fallback
    return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
}

function loadEnvFiles() {
  const tried: string[] = [];
  const candidates = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
    // When running from compiled code in server/dist, runtimeDir is server/dist
    path.join(getRuntimeDir(), '..', '.env.local'),
    path.join(getRuntimeDir(), '..', '.env'),
  ];
  for (const p of candidates) {
    tried.push(p);
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      console.log(`[config] Loaded env from ${p}`);
      return;
    }
  }
  dotenv.config();
  console.log(`[config] Loaded env from process environment (no file found). Tried: ${tried.join(', ')}`);
}

loadEnvFiles();

export const config = {
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
  OPENAI_PROJECT: process.env.OPENAI_PROJECT || '',
};
