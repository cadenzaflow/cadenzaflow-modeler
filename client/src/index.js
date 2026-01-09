/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import './styles/style.less';

import { flags, globals, metadata, plugins } from './globals';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  AppParent,
  KeyboardBindings,
  TabsProvider,
} from './app';

import Metadata from './util/Metadata';
import Flags from './util/Flags';

import debug from 'debug';

// This fix is necessary because dragular expects `global` to be defined, see
// https://github.com/bevacqua/dragula/issues/602 for context
window.global = window;

if (process.env.NODE_ENV !== 'production') {
  debug.enable('*,-sockjs-client:*');
}

Metadata.init(metadata);
Flags.init(flags);

const keyboardBindings = new KeyboardBindings({
  isMac: globals.isMac
});




async function render() {

  const spinner = document.querySelector('body > .spinner-border');
  const log = (msg) => {
    if (spinner) spinner.title = msg;
    console.log('[Startup]', msg);
  };

  log('Starting render...');

  if (process.env.NODE_ENV !== 'production') {
    const { loadA11yHelper } = await import('./util/a11y');
    await loadA11yHelper();
  }

  // load plugins
  plugins.bindHelpers(window);

  log('Loading plugins...');
  await plugins.loadAll();
  log('Plugins loaded.');

  const rootElement = document.querySelector('#root');

  const onStarted = () => {
    log('Client started event received. Hiding spinner.');
    // mark as finished loading
    if (spinner) spinner.classList.add('hidden');
  };

  const tabsProvider = new TabsProvider(plugins.get('tabs'), globals.settings);

  log('Mounting AppParent...');
  ReactDOM.render(
    <AppParent
      keyboardBindings={keyboardBindings}
      globals={globals}
      tabsProvider={tabsProvider}
      onStarted={onStarted}
    />, rootElement
  );
  log('AppParent mounted.');
}

render();
