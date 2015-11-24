var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();


exports.editor = {
    description: "Store output of a stage for use elsewhere",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_name">Name of stash</label>' +
                      '<input id="{{actionId}}_name" type="text" class="form-control" placeholder="Build Results" value="{{name}}">' +                      
                      '<p class="help-block">This name is used when you need to unstash onto a new node.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_includes">Includes</label>' +
                        '<input id="{{actionId}}_includes" type="text" class="form-control" placeholder="./target" value="{{includes}}">' +
                        '<label for="{{actionId}}_excludes">Excludes</label>' +
                        '<input id="{{actionId}}_excludes" type="text" class="form-control" placeholder="" value="{{excludes}}">' +                        
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_name").val();
      currentStep.includes = $('#' + actionId + "_includes").val();
      currentStep.excludes = $('#' + actionId + "_excludes").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'stash name: "' + stepInfo.name + '", includes: "' + stepInfo.includes + '", excludes: "' + stepInfo.excludes + '"';
    },
};
