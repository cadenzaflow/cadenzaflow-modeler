/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

import translations from './translations';

function cadenzaFlowTranslate(template, replacements) {
  replacements = replacements || {};

  template = translations[template] || template;

  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] != null ? replacements[key] : '{' + key + '}';
  });
}

export default {
  translate: [ 'value', cadenzaFlowTranslate ]
};
