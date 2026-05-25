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
