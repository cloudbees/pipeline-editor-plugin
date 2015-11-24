/**
 * A rick rolling module.
 */

var renderTemplate = require('./template').renderTemplate;

exports.editor = {
    description: "Never going to give you up",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="embed-responsive embed-responsive-4by3">' +
                        '<iframe class="embed-responsive-item" src="https://www.youtube.com/embed/dQw4w9WgXcQ">' +
                        '</iframe>' +
                     '</div>';              
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      console.log("current step for rick is" + currentStep + actionId);
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      console.log(stepInfo);
      return '/* you have been rick rolled */';
    },
};
