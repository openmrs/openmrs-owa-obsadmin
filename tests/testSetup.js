/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
require('babel-register')();
const spy = require('sinon').spy;
const jsdom = require('jsdom').jsdom;

const exposedProperties = ['window', 'navigator', 'document', 'node'];

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};
if (!global.window.localStorage) {
  global.window.localStorage = {
    getItem() { return undefined; },
    setItem() {},
    removeItem() { return undefined; },
  };
}
global.window = window;
global.$ = spy(() => ({
  validate: (context) => {
    Object.keys(context.rules).forEach(key => new Promise((resolve) => {
      if (context.rules[key].required) {
        return resolve(context.submitHandler());
      }
    }));
  },
  data: () => true,
  validator: {
    addMethod: () => {}
  },
  on: spy(),
}));
const documentRef = document;