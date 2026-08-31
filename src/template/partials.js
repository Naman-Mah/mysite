/**
 * Zero-dependency template partials registry.
 */
import fs from 'node:fs';
import path from 'node:path';

export class PartialsRegistry {
  constructor() {
    this.partials = new Map();
  }

  register(name, content) {
    this.partials.set(name, content);
  }

  get(name) {
    return this.partials.get(name) || '';
  }

  loadFromDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.endsWith('.html') || file.endsWith('.hbs') || file.endsWith('.mustache')) {
        const name = path.basename(file, path.extname(file));
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        this.register(name, content);
      }
    }
  }
}
