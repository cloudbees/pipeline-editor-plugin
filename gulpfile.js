//
// See https://github.com/tfennelly/jenkins-js-builder
//
var builder = require('jenkins-js-builder');

builder.bundle('src/main/js/pipelineeditor.js')
  .withExternalModuleMapping('bootstrap-detached', 'bootstrap:bootstrap3', {addDefaultCSS: true})
  .withExternalModuleMapping('handlebars', 'handlebars:handlebars3')
  .less('src/main/less/pipelineeditor.less')
  .inDir('src/main/resources/org/jenkinsci/plugins/pipelineeditor');
 
