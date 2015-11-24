To extend and add more editors, take a look at an existing one. 

editors are an object that follows a signature like: 

```
exports.editor = {
    description: "Clone a git repository",        
    renderEditor : function(stepInfo, actionId) {      
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_url">Git repository to clone</label>' +
                      '<input id="{{actionId}}_url" type="text" class="form-control" placeholder="git@github.com:cloudbees/sample.git" value="{{url}}">' +                      
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Git clone" value="{{name}}">' +
                      '</div>' +
                    '</div>';        
      
      return renderTemplate(template, stepInfo, { "actionId" : actionId });      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep.name = $('#' + actionId + "_stepName").val();
      currentStep.url = $('#' + actionId + "_url").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'git ' + stepInfo.url;
    },
};
```

it is up to each editor to render a form - in this case a template is used that reads value out of the stepInfo object. It also has to save changes back to the current step (in this case only name and url are saved or displayed). Finally the results are rendered as workflow script.

In theory (to be validated) adding an editor to window.pipelineEditors object (hashmap) where the key is the type, is all that is needed. see `all.js` for how this is done. This could be done by additional plugins (adjuncts).
