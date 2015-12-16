var renderTemplate = require('./template').renderTemplate;
var $ = require('bootstrap-detached').getBootstrap();


module.exports = {
    description: "Archive an artifact permanently",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                        '<p class="help-block">Store an artifact permanently as part of a build record.</p>' +
                        '<label for="{{actionId}}_includes">Includes</label>' +
                        '<input id="{{actionId}}_includes" type="text" class="form-control" placeholder="./results" value="{{includes}}">' +
                        '<label for="{{actionId}}_excludes">Excludes</label>' +
                        '<input id="{{actionId}}_excludes" type="text" class="form-control" placeholder="./work" value="{{excludes}}">' +                        
                      '</div>';
      var info = $.extend({"includes" : "./results"}, stepInfo);  
      info = $.extend({"excludes" : "./work"}, info);  
      return renderTemplate(template, info, { "actionId" : actionId });      
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
      return 'archive excludes: "' + stepInfo.excludes + '", includes: "' + stepInfo.includes + '"';
    },
};
