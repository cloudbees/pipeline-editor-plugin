/**
 * editor modules. Needs to be loaded before editor.js.
 */


var ShellModule = {
    description: "Run a shell script",        
    
    renderEditor : function(stepInfo, actionId) {          
      // provide a form to edit
      var template = '<div class="form-group">' +
                      '<label for="{{actionId}}_command">Command</label>' +
                      '<textarea id="{{actionId}}_command" class="form-control" rows=5 style="font-family:monospace;">{{command}}</textarea>' +
                      '<p class="help-block">Run a command in the currently allocated build server. All standard shell scripting commands apply.</p>' +
                      '</div>' +
                      '<div class="form-group">' +
                        '<label for="{{actionId}}_stepName">Step name</label>' +
                        '<input id="{{actionId}}_stepName" type="text" class="form-control" placeholder="Run a shell command" value="{{name}}">' +
                      '</div>' +
                    '</div>';      
        
        return renderTemplate(template, stepInfo, { "actionId" : actionId });
      
    },
    
    readChanges : function(actionId, currentStep) {
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      currentStep["name"] = $('#' + actionId + "_stepName").val();
      currentStep["command"] = $('#' + actionId + "_command").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'sh "' + stepInfo['command'] + '"';
    },
};

var GitModule = {
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
      currentStep["name"] = $('#' + actionId + "_stepName").val();
      currentStep["url"] = $('#' + actionId + "_url").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'git ' + stepInfo['url'];
    },
};

var StashModule = {
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
      currentStep["name"] = $('#' + actionId + "_name").val();
      currentStep["includes"] = $('#' + actionId + "_includes").val();
      currentStep["excludes"] = $('#' + actionId + "_excludes").val();
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return 'stash name: "' + stepInfo['name'] + '", includes: "' + stepInfo['includes'] + '", excludes: "' + stepInfo['excludes'] + '"';
    },
};

var RickModule = {
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
      // read the changes from the form and apply them. 
      // if it all checks out, return true, otherwise don't apply them, and return false. 
      return true; //this will cause pipeline view to be re-rendered.
    },
    
    generateScript : function(stepInfo){
      return '/* you have been rick rolled */';
    },
};


var editorModules = {
  "sh" : ShellModule,
  "git" : GitModule,
  "stash" : StashModule,
  "rick" : RickModule  
};
