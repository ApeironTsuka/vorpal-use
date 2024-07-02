# vorpal-use

An extension for [Vorpal](https://github.com/ApeironTsuka/vorpal).

Forgot to install a useful extension in development and now you need it live? No problem.

This will install a `use` command into one's Vorpal instance, which will automatically import a given NPM module acting as a Vorpal extension, and register the commands contained inside while the app is still live. This import has an in-memory lifecycle and the module is dumped when the thread quits.

```bash
node~$
node~$ use vorpal-repl
Installing vorpal-repl from the NPM registry:
Successfully registered 1 new command.
node~$
node~$ repl
node~$ repl: 6*8
48
node~$ repl:
```

### Installation

```bash
npm install @ApeironTsuka/vorpal-use --save
```

### Usage

```js
import Vorpal from '@ApeironTsuka/vorpal';
import use from '@ApeironTsuka/vorpal-use';

const vorpal = new Vorpal();

vorpal
  .delimiter('node~$')
  .use(use)
  .show();
```

### License

MIT
