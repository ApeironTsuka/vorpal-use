'use strict';

import assert from 'assert';
import should from 'should';
import Vorpal from '@ApeironTsuka/vorpal';
import use from '../lib/index.js';

let stdout = '', vorpal;

function pipeFn(data) {
  stdout += data;
  return '';
}

function stdoutFn() {
  const result = stdout;
  stdout = '';
  return result;
}

describe('vorpal-use', () => {
  before('vorpal preps', () => {
    vorpal = new Vorpal()
      .pipe(pipeFn)
      .show();
  });

  beforeEach('vorpal preps', () => {
    stdout = '';
  });

  it('should exist and be a function', () => {
    should.exist(use);
    use.should.be.type('function');
  });

  it('should import into Vorpal', () => {
    (() => {
      vorpal.use(use);
    }).should.not.throw();
  });

  it('should install a live vorpal-module', function (done) {
    this.timeout(90000);
    vorpal.exec('use @ApeironTsuka/vorpal-hacker-news').then(() => {
      const out = stdoutFn();
      out.should.containEql('Successfully registered');
      done();
    }).catch((err, data) => {
      console.log(stdoutFn());
      console.log(err, data);
      done(err);
    });
  });

  it('should run the live vorpal-module\'s command', function (done) {
    this.timeout(20000);
    vorpal.exec('hacker-news').then(() => {
      stdoutFn().should.containEql('points by');
      done();
    }).catch((err) => {
      done(err);
    });
  });
});
