/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import React, { forwardRef } from 'react';

import {
  find,
  forEach,
  sortBy
} from 'min-dash';

import replaceIds from '@bpmn-io/replace-ids';

import { Linter as BpmnLinter } from '@camunda/linting';


import bpmnDiagram from './tabs/bpmn/diagram.bpmn';
import dmnDiagram from './tabs/dmn/diagram.dmn';
import formDiagram from './tabs/form/initial.form';

import {
  ENGINES
} from '../util/Engines';

import EmptyTab from './EmptyTab';

import parseDiagramType from './util/parseDiagramType';



import Metadata from '../util/Metadata';

import {
  generateId
} from '../util';

import Flags, {
  DISABLE_DMN,
  DISABLE_FORM,
  DISABLE_PLATFORM,
  DISABLE_HTTL_HINT,
  DEFAULT_HTTL
} from '../util/Flags';

import BPMNIcon from '../../resources/icons/file-types/BPMN.svg';
import DMNIcon from '../../resources/icons/file-types/DMN.svg';
import FormIcon from '../../resources/icons/file-types/Form.svg';

import { getDefaultVersion } from './tabs/EngineProfile';

import { utmTag } from '../util/utmTag';

const BPMN_HELP_MENU = [
  {
    label: 'BPMN 2.0 Tutorial',
    action: utmTag('https://docs.cadenzaflow.org/manual/latest/reference/bpmn20/')
  }
];



const DMN_HELP_MENU = [
  {
    label: 'DMN Tutorial',
    action: utmTag('https://docs.cadenzaflow.org/manual/latest/reference/dmn/')
  }
];

const createdByType = {};

const noopProvider = {
  getComponent() {
    return null;
  },
  getInitialContents() {
    return null;
  }
};

const ENCODING_BASE64 = 'base64',
      ENCODING_UTF8 = 'utf8';

const EXPORT_JPEG = {
  name: 'JPEG image',
  encoding: ENCODING_BASE64,
  extensions: [ 'jpeg' ]
};

const EXPORT_PNG = {
  name: 'PNG image',
  encoding: ENCODING_BASE64,
  extensions: [ 'png' ]
};

const EXPORT_SVG = {
  name: 'SVG image',
  encoding: ENCODING_UTF8,
  extensions: [ 'svg' ]
};

const DEFAULT_PRIORITY = 1000;

/**
 * A provider that allows us to customize available tabs.
 */
export default class TabsProvider {

  constructor(plugins = [], settings) {
    const self = this;
    this.settings = settings;
    this.providers = {
      empty: {
        canOpen(file) {
          return false;
        },
        getComponent() {
          return forwardRef(function EmptyTabProducer(props, ref) {
            return <EmptyTab ref={ ref } { ...props } tabsProvider={ self } />;
          });
        },
        getIcon() {
          return null;
        }
      },
      bpmn: {
        name: 'BPMN',
        encoding: ENCODING_UTF8,
        exports: {
          png: EXPORT_PNG,
          jpeg: EXPORT_JPEG,
          svg: EXPORT_SVG
        },
        extensions: [ 'bpmn', 'xml' ],
        canOpen(file) {
          return parseDiagramType(file.contents) === 'bpmn';
        },
        getComponent(options) {
          return import('./tabs/bpmn');
        },
        getIcon() {
          return BPMNIcon;
        },
        getInitialContents(options) {
          return bpmnDiagram;
        },
        getInitialFilename(suffix) {
          return `diagram_${suffix}.bpmn`;
        },
        getHelpMenu() {
          return BPMN_HELP_MENU;
        },
        getNewFileMenu() {
          return [ {
            label: 'BPMN diagram',
            group: 'CadenzaFlow',
            action: 'create-bpmn-diagram'
          } ];
        },
        getLinter(plugins) {

          if (Flags.get(DISABLE_HTTL_HINT)) {
            plugins = [
              DisableHTTLHintPlugin(),
              ...plugins
            ];
          }

          return new BpmnLinter({
            modeler: 'desktop',
            type: 'platform',
            plugins
          });
        }
      },
      dmn: {
        name: 'DMN',
        encoding: ENCODING_UTF8,
        exports: {
          png: EXPORT_PNG,
          jpeg: EXPORT_JPEG,
          svg: EXPORT_SVG
        },
        extensions: [ 'dmn', 'xml' ],
        canOpen(file) {
          return parseDiagramType(file.contents) === 'dmn';
        },
        getComponent(options) {
          return import('./tabs/dmn');
        },
        getIcon() {
          return DMNIcon;
        },
        getInitialContents() {
          return dmnDiagram;
        },
        getInitialFilename(suffix) {
          return `diagram_${suffix}.dmn`;
        },
        getHelpMenu() {
          return DMN_HELP_MENU;
        },
        getNewFileMenu() {
          return [ {
            label: 'DMN diagram',
            group: 'CadenzaFlow',
            action: 'create-dmn-diagram'
          } ];
        },
        getLinter() {
          return null;
        }
      },
      form: {
        name: 'Form',
        encoding: ENCODING_UTF8,
        exports: {
        },
        extensions: [ 'form' ],
        canOpen(file) {
          return parseDiagramType(file.contents) === 'form';
        },
        getComponent(options) {
          return import('./tabs/form');
        },
        getIcon() {
          return FormIcon;
        },
        getInitialContents(options) {
          return formDiagram;
        },
        getInitialFilename(suffix) {
          return `form_${suffix}.form`;
        },
        getHelpMenu() {
          return [];
        },
        getNewFileMenu() {
          return [ {
            label: 'Form',
            group: 'CadenzaFlow',
            action: 'create-form'
          } ];
        },
        getLinter() {
          return null;
        }
      }
    };

    plugins.forEach((tabs) => {
      this.providers = {
        ...this.providers,
        ...tabs
      };
    });

    this.providersByFileType = Object.entries(this.providers).reduce((acc, [ key, provider ]) => {
      const { extensions } = provider;
      if (!extensions) {
        return acc;
      }

      extensions.forEach(extension => {
        acc[extension] = acc[extension] || [];
        acc[extension].push(provider);
      });

      return acc;
    }, {});

    if (Flags.get(DISABLE_PLATFORM)) {
      this.providersByFileType.bpmn = this.providersByFileType.bpmn.filter(p => p !== this.providers.bpmn);
      delete this.providers.bpmn;

      delete this.providers.dmn;
      delete this.providersByFileType.dmn;

      delete this.providers.form;
    }

    if (Flags.get(DISABLE_DMN)) {
      delete this.providers.dmn;
      delete this.providersByFileType.dmn;
    }

    if (Flags.get(DISABLE_FORM)) {
      delete this.providers.form;
      delete this.providersByFileType.form;
    }
  }

  getProviderNames() {
    const names = [];

    forEach(this.providers, (provider) => {
      const { name } = provider;

      if (name && !names.includes(name)) {
        names.push(name);
      }
    });

    return names;
  }

  getProviders() {
    return this.providers;
  }

  hasProvider(fileType) {
    return !!this._getProvidersForExtension(fileType).length;
  }

  getProvider(type) {
    return (this.providers[type] || noopProvider);
  }

  /**
   * Returns provider if available.
   *
   * Algorithm:
   * * check if there are providers defined for the file extension
   *   * if there is only one, return it (happy path)
   *   * if there are more than one:
   *     * return the first provider which can open the file
   *     * otherwise return the last provider
   *   * if there are none, return the first provider (by priority) which can open the file or `null`
   *
   * @param {import('./TabsProvider').File} file
   * @returns {Object | null}
   */
  getProviderForFile(file) {
    const typeFromExtension = getTypeFromFileExtension(file);

    const providersForExtension = this._getProvidersForExtension(typeFromExtension);

    // single provider specified for the extension
    if (providersForExtension.length === 1) {
      return providersForExtension[0];
    }

    // multiple providers specified for the extension
    if (providersForExtension.length > 1) {
      const provider = findProviderForFile(providersForExtension, file);

      // return the matching provider or the first by priority provider as fallback
      return provider || sortByPriority(providersForExtension)[0];
    }

    // no providers specified for the extension; return the first that can open the file
    const provider = findProviderForFile(sortByPriority(this.providers), file);

    return provider || null;
  }

  getTabComponent(type, options) {
    return this.getProvider(type).getComponent(options);
  }

  getTabIcon(type, options) {
    return this.getProvider(type).getIcon(options);
  }

  createTab(type) {
    const file = this._createFile(type);

    return this.createTabForFile(file);
  }

  createTabForFile(file) {

    const id = generateId();

    const type = this._getTabType(file);

    if (!type) {
      return null;
    }

    // fill empty file with initial contents
    if (!file.contents) {
      file.contents = this._getInitialFileContents(type);
    }

    return {
      file,
      id,
      get name() {
        return this.file.name;
      },
      set name(newName) {
        this.file.name = newName;
      },
      get title() {
        return this.file.path || '(new file)';
      },
      type
    };
  }

  linkSettings(settings) {
    this.settings = settings;
  }

  _createFile(type) {

    const counter = (
      type in createdByType
        ? (++createdByType[type])
        : (createdByType[type] = 1)
    );

    const name = this._getInitialFilename(type, counter);

    const contents = this._getInitialFileContents(type);

    return {
      name,
      contents,
      path: null
    };
  }

  _getInitialFilename(providerType, suffix) {
    const provider = this.providers[providerType];

    return provider.getInitialFilename(suffix);
  }

  _getInitialFileContents(type) {
    const rawContents = this.getProvider(type).getInitialContents();

    return rawContents && replaceHistoryTimeToLive(
      replaceExporter(
        replaceVersions(
          replaceIds(rawContents, generateId),
          this.settings
        )
      )
    );
  }

  _getTabType(file) {
    const provider = this.getProviderForFile(file);

    if (!provider) {
      return null;
    }

    for (let type in this.providers) {
      if (this.providers[type] === provider) {
        return type;
      }
    }
  }

  _getProvidersForExtension(extension) {
    return this.providersByFileType[extension] || [];
  }
}



// helper ///////////////////

function getTypeFromFileExtension(file) {
  const { name } = file;

  return name.substring(name.lastIndexOf('.') + 1).toLowerCase();
}

function findProviderForFile(providers, file) {
  return find(providers, provider => {
    if (provider.canOpen(file)) {
      return provider;
    }
  });
}

/**
 * Sorts a list of providers by priority (descending).
 *
 * @param {Array|Object} providers
 * @returns {Array}
 */
function sortByPriority(providers) {
  return sortBy(providers, p => (p.priority || DEFAULT_PRIORITY) * -1);
}


function replaceVersions(contents, settings) {

  const settingsVersion = {
    [ENGINES.PLATFORM]: settings?.get('app.defaultC7Version')
  };

  const platformVersion = getDefaultVersion(ENGINES.PLATFORM, settingsVersion[ENGINES.PLATFORM]);

  return (
    contents
      .replace('{{ CAMUNDA_PLATFORM_VERSION }}', platformVersion)
  );
}

function replaceExporter(contents) {
  const {
    name,
    version
  } = Metadata;

  return (
    contents
      .replace('{{ EXPORTER_NAME }}', name)
      .replace('{{ EXPORTER_VERSION }}', version)
  );
}

function DisableHTTLHintPlugin() {
  return {
    config: {
      rules: {
        'bpmnlint-plugin-camunda-compat/history-time-to-live': 'off'
      }
    }
  };
}

function replaceHistoryTimeToLive(contents) {
  if (!Flags.get(DEFAULT_HTTL)) {
    return contents.replace('camunda:historyTimeToLive="{{ DEFAULT_HTTL }}"', '');
  }
  return (
    contents
      .replace('{{ DEFAULT_HTTL }}', Flags.get(DEFAULT_HTTL))
  );
}
