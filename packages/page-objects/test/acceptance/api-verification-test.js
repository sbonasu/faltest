'use strict';

const { describe, it } = require('../../../../helpers/mocha');
const { expect } = require('../../../../helpers/chai');
const { setUpWebDriver } = require('../../../lifecycle');
const {
  BasePageObject,
  Element,
} = require('../../src');
const Server = require('../../../../helpers/server');
const { promisify } = require('util');
const createTmpDir = promisify(require('tmp').dir);
const writeFile = promisify(require('fs').writeFile);
const path = require('path');

describe(function() {
  setUpWebDriver.call(this, {
    shareWebdriver: true,
    keepBrowserOpen: true,
    overrides: {
      waitforTimeout: 0,
      browser: 'firefox',
    },
  });

  let fixturesPath;

  before(function() {
    this.createPage = function(Page) {
      return new Page(this.browser);
    };

    this.open = async function(pathname) {
      await this.browser.url(`http://localhost:${this.port}/${pathname}`);
    };

    this.writeFixture = async function(filename, fixtureData) {
      await writeFile(path.join(fixturesPath, filename), fixtureData);
    };
  });

  beforeEach(async function() {
    fixturesPath = await createTmpDir();

    this.server = new Server(fixturesPath);

    this.port = await this.server.start();
  });

  afterEach(async function() {
    if (this.server) {
      await this.server.stop();
    }
  });

  it(Element.prototype.isEnabled, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" disabled>
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .enabled.to.eventually.be.false;
  });

  it(Element.prototype.waitForEnabled, async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForEnabled())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.waitForDisabled, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" disabled>
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForDisabled())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.isDisplayed, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" style="display:none">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .displayed.to.eventually.be.false;
  });

  it(Element.prototype.waitForVisible, async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForVisible())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.waitForHidden, async function() {
    await this.writeFixture('index.html', `
      <input class="foo" style="display:none">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForHidden())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.isExisting, async function() {
    await this.writeFixture('index.html', `
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .exist.to.eventually.be.false;
  });

  it(Element.prototype.waitForInsert, async function() {
    await this.writeFixture('index.html', `
      <input class="foo">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForInsert())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.waitForDestroy, async function() {
    await this.writeFixture('index.html', `
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.waitForDestroy())
      .to.eventually.be.fulfilled;
  });

  it(Element.prototype.getAttribute, async function() {
    await this.writeFixture('index.html', `
      <div class="foo">
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('.foo');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo.getAttribute('class'))
      .to.eventually.equal('foo');
  });

  it(Element.prototype.selectByVisibleText, async function() {
    await this.writeFixture('index.html', `
      <select id="selectbox">
        <option value="someValue0">uno</option>
        <option value="someValue1">dos</option>
      </select>
    `);

    this.page = this.createPage(class extends BasePageObject {
      get foo() {
        return this._create('#selectbox');
      }
    });

    await this.open('index.html');

    await expect(this.page.foo)
      .value.to.eventually.equal('someValue0');

    await this.page.foo.selectByVisibleText('dos');

    await expect(this.page.foo)
      .value.to.eventually.equal('someValue1');
  });
});
