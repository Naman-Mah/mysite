/**
 * Zero-dependency site configuration loader.
 */
import fs from 'node:fs';
import path from 'node:path';

export function loadConfig(srcDir) {
  const defaultConfig = {
    title: 'mysite — Zero-Dependency SSG',
    description: 'A website generated with zero npm dependencies',
    author: 'mysite',
    baseUrl: 'http://localhost:3000',
    theme: 'default'
  };

  const configPath = path.join(srcDir, 'mysite.config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const userConfig = JSON.parse(raw);
      return { ...defaultConfig, ...userConfig };
    } catch (err) {
      console.warn(`[config] Failed to parse mysite.config.json: ${err.message}`);
    }
  }

  return defaultConfig;
}
