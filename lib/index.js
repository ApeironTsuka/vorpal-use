
'use strict';

/**
 * Module dependencies.
 */

import chalk from 'chalk';
import { tmpdir } from 'node:os';
import fs from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tempDir = getTempDir();

function pipeConfig(level) {
  switch (level) {
    case 'all': return 'inherit';
    case 'error': return [ 'ignore', 'ignore', 'inherit' ];
    case 'silent':
    default: return 'ignore';
  }
}

function getTempDir() { return fs.mkdtempSync(join(tmpdir(), 'vorpal-')); }

function npmInstall(cwd, options, cb) {
  const child = spawn('npm', [ 'install', options.module ], { stdio: pipeConfig(options.loglevel), cwd });
  child.on('error', (err) => { cb(err); });
  child.on('close', () => { cb(); });
}

function loadModule(path, cb) {
  const pkg = JSON.parse(fs.readFileSync(`${path}/package.json`));
  if ((pkg.type === 'module') || (/\.mjs/i.test(pkg.main))) { import(path).then((mod) => { cb(mod.default); }); }
  else { cb(require(path)); }
}

export default function (vorpal) {
  /**
   * Imports node module in realtime.
   */
  vorpal
    .command('use <module>')
    .description('Installs a Vorpal extension in realtime.')
    .action(function (args, cb) {
      let options = {
        module: args.module,
        loglevel: args.options.loglevel || 'error'
      };
      this.log(chalk.white('Installing ' + options.module + ' from the NPM registry:'));
      _use.call(vorpal, options, (err, data) => {
        if (err) {
          this.log(err);
        } else {
          const commands = (data || {}).registeredCommands;
          if (commands < 1) {
            this.log(chalk.yellow(`No new commands were registered. Are you sure you ${options.module} is a vorpal extension?`));
          } else {
            this.log(chalk.white(`Successfully registered ${commands} new command${commands > 1 ? 's' : ''}.`));
          }
        }
        cb();
      });
    });
};

/**
 * Requires a vantage module / middleware and
 * and `.use`s it. If the module doesn't exist
 * locally, it will NPM install it into a temp
 * directory and then use it.
 *
 * @param {String} key
 * @param {String} value
 * @return {Function}
 * @api private
 */

function _use(options, callback) {
  let registeredCommands = 0;

  options = (typeof options === 'string')
    ? { module: options }
    : (options || {});

  options.loglevel = options.loglevel || 'silent';

  function registryCounter() {
    registeredCommands++;
  }

  function load(cbk) {
    npmInstall(tempDir, options, (err) => {
      if (err) { cbk(err); }
      else {
        const dir = `${tempDir}/node_modules/${options.module}`;
        loadModule(dir, (mod) => { cbk(undefined, mod); });
      }
    });
  }

  load((err, mod) => {
    if (err) {
      callback(true, `Error downloading module: ${mod}`);
    } else {
      this.on('command_registered', registryCounter);
      this.use(mod);
      this.removeListener('command_registered', registryCounter);
      callback(undefined, { registeredCommands });
    }
  });
}
