/**
 * Zero-dependency CLI argument parser (Replaces commander / yargs / minimist).
 *
 * @param {string[]} rawArgs - e.g. process.argv.slice(2)
 * @returns {{ command: string, positional: string[], flags: Record<string, string|number|boolean> }}
 */
export function parseArgv(rawArgs = []) {
  let command = '';
  const positional = [];
  const flags = {};

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=', 2);
        flags[k] = parseValue(v);
      } else {
        const nextArg = rawArgs[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          flags[key] = parseValue(nextArg);
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const key = arg.slice(1);
      const nextArg = rawArgs[i + 1];
      if (nextArg !== undefined && !nextArg.startsWith('-')) {
        flags[key] = parseValue(nextArg);
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      if (!command && positional.length === 0) {
        command = arg;
      } else {
        positional.push(arg);
      }
    }
  }

  return { command, positional, flags };
}

function parseValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (!isNaN(val) && val.trim() !== '') return Number(val);
  return val;
}
