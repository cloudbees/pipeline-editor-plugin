
var $ = require('bootstrap-detached').getBootstrap();

var Belay = (function(){
  var settings = {
                    strokeColor       : '#fff',
                    strokeWidth       : 10,
                    opacity           : 1,
                    fill              : 'none',
                    animate           : true,
                    animationDirection: 'right',
                    animationDuration : .3
                 };
  var me = {};

  me.init = function(initObj) {
      if (initObj) {
        $.each(initObj, function(index, value) {
           //TODO validation on settings
           settings[index] = value;
        });
      }
  }

  me.set = function(prop, val){
    //TODO validate
    settings[prop] = val;
  }

  me.on = function(el1, el2){
    var $el1 = $(el1);
    var $el2 = $(el2);
    if ($el1.length && $el2.length) {
      var svgheight
          ,p
          ,svgleft
          ,svgtop
          ,svgwidth

      var el1pos = $(el1).offset();
      var el2pos = $(el2).offset();

      var el1H = $(el1).outerHeight();
      var el1W = $(el1).outerWidth();

      var el2H = $(el2).outerHeight();
      var el2W = $(el2).outerWidth();

      svgleft = Math.round(el1pos.left + el1W);
      svgwidth = Math.round(el2pos.left - svgleft);

      var curvinessFactor, cpt;

      ////Determine which is higher/lower
      if( (el2pos.top+(el2H/2)) <= ( el1pos.top+(el1H/2))){
        // console.log("low to high");        
        svgheight = Math.round((el1pos.top+el1H/2) - (el2pos.top+el2H/2));
        svgtop = Math.round(el2pos.top + el2H/2) - settings.strokeWidth;        
        cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
        p = "M0,"+ (svgheight+settings.strokeWidth) +" C"+cpt+","+(svgheight+settings.strokeWidth)+" "+(svgwidth-cpt)+"," + settings.strokeWidth + " "+svgwidth+"," + settings.strokeWidth;          
      }else{
        // console.log("high to low");
        svgheight = Math.round((el2pos.top+el2H/2) - (el1pos.top+el1H/2));
        svgtop = Math.round(el1pos.top + el1H/2) - settings.strokeWidth;  
        cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
        p = "M0," + settings.strokeWidth + " C"+ cpt +",0 "+ (svgwidth-cpt) +","+(svgheight+settings.strokeWidth)+" "+svgwidth+","+(svgheight+settings.strokeWidth);                  
      }
      
      //ugly one-liner
      $ropebag = $('#ropebag').length ? $('#ropebag') : $('body').append($( "<div id='ropebag' />" )).find('#ropebag');

      var svgnode = document.createElementNS('http://www.w3.org/2000/svg','svg');
      var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");
      newpath.setAttributeNS(null, "d", p);
      newpath.setAttributeNS(null, "stroke", settings.strokeColor);
      newpath.setAttributeNS(null, "stroke-width", settings.strokeWidth);
      newpath.setAttributeNS(null, "opacity", settings.opacity);
      newpath.setAttributeNS(null, "fill", settings.fill);      
      svgnode.appendChild(newpath);
      //for some reason, adding a min-height to the svg div makes the lines appear more correctly.
      $(svgnode).css({left: svgleft, top: svgtop, position: 'absolute',width: svgwidth, height: svgheight + settings.strokeWidth*2, minHeight: '20px' });
      $ropebag.append(svgnode);
      if (settings.animate) {
        // THANKS to http://jakearchibald.com/2013/animated-line-drawing-svg/
        var pl = newpath.getTotalLength();
        // Set up the starting positions
        newpath.style.strokeDasharray = pl + ' ' + pl;

        if (settings.animationDirection == 'right') {
          newpath.style.strokeDashoffset = pl;
        } else {
          newpath.style.strokeDashoffset = -pl;
        }

        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        // WON'T WORK IN IE. If you want that, use requestAnimationFrame to update instead of CSS animation
        newpath.getBoundingClientRect();
        newpath.style.transition = newpath.style.WebkitTransition ='stroke-dashoffset ' + settings.animationDuration + 's ease-in-out';
        // Go!
        newpath.style.strokeDashoffset = '0';
      }
    }
  }

  me.off = function(){
    $("#ropebag").empty();
  }

  return me;
}());


var pipeline = 
[
  {
    "name" : "Checkout",
    "steps" : [
      {"type": "git", "name" : "Clone webapp", "url" : "git@github.com/thing/awesome.git"},
    ]    
  },
  
  
  {
    "name" : "Prepare Test Database",
    "steps" : [
      {"type": "sh", "name" : "Install Postgress", "command" : "install_postgres"},
      {"type": "sh", "name" : "Initialise DB", "command" : "pgsql data/init.sql"},
    ]    
  },
  
  

  {
    "name" : "Prepare",
    "streams" : [
      {"name" : "Ruby", "steps" : [
        {"type": "sh", "name" : "Install Ruby", "command" : "/bin/ci/install_ruby version=2.0.1"},
        {"type": "stash", "name" : "Stash compiled app", "includes": "/app", "excludes" : ""} 
      ]},
      {"name" : "Python","steps" : [
        {"type": "sh", "name" : "Yeah", "command" : "exit()"},
        
      ]}
    ]    
  },
  
  {
    "name" : "Stage and Test",
    "steps" : []    
  },
  
  {
    "name" : "Approve",
    "steps" : [],
    "type" : "input"    
  },
  
  {
    "name" : "Deploy",
    "steps" : [],
    "node" : "devops-production"    
  },
  
  {
    "name" : "Party",
    "steps" : [{"type": "rick", "name" : "Awesome" } ]    
  }

  
]


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



/**
 * Draw the pipeline visualisation based on the pipeline data, including svg.
 * Current pipeline is stored in the "pipeline" variable assumed to be in scope. 
 */
exports.drawPipeline = function () {  
  pRow = $('#pipeline-row');
  pRow.empty();
  

  
  for (var i=0; i < pipeline.length; i++) {
    var stage = pipeline[i];
    var currentId = "stage-" + i;      
    //append a block if non parallel
    if (!isParallelStage(stage)) {      
      stageElement = normalStageBlock(currentId, stage);
      pRow.append(stageElement);
    } else {      
      subStages = "";
      var currentPils = [];
      for (j = 0; j < stage.streams.length; j++) {
        var subStage = stage.streams[j];
        var subStageId = currentId + "-" + j;                
        subStages += parStageBlock(stage['name'], subStageId, subStage);
      }      
      stageElement = '<div class="col-md-3"><ul class="list-unstyled">' + subStages + '</ul></div>';
      pRow.append(stageElement);
            
    }
  }
  
  autoJoin();
  
}

/**
 * parallel stages are an item in an ordered list.
 */
function parStageBlock(stageName, subStageId, subStage) {
  var subStageName = stageName + ": " +  subStage['name'];
  //OMG String + + String == weirdness!
  return '<li><div id="' + subStageId + '"  class="panel panel-default"><div class="panel-heading">' +
                  '<a role="button" onclick="javascript:autoJoinDelay();" data-toggle="collapse" href="#' + subStageId + '_collapse">'  + 
                  subStageName + '</a>' + '<div class="collapse" id="' + subStageId + '_collapse">' +
                  stepListing(subStageId, subStage.steps) + '</div>'
                  + '</div></div></li>';
}

/**
 * A non parallel stage. Parallel stages are a pipeline editor construct, not an inherent workflow property.
 */
function normalStageBlock(currentId, stage) {
  return '<div class="col-md-3"><div id="' + currentId + '" class="panel panel-default"><div class="panel-heading">' 
                + '<a role="button" onclick="javascript:autoJoinDelay();" data-toggle="collapse" href="#' + currentId + '_collapse">' + 
                stage['name'] + '</a>' + '<div class="collapse" id="' + currentId + '_collapse">' +
                stepListing(currentId, stage.steps) + '</div>' + '</div></div></div>';
}

/**
 * Take a list of steps and return a listing of steps
 */
function stepListing(stageId, steps)  {
  if (!steps) {
    return '';
  } else {
    buttons = '&nbsp;';
    for (var j=0; j < steps.length; ++j) {
        actionId = stageId + "-" + j;                
        buttons += '<a class="list-group-item" href="#" onClick="javascript:openEditor(\'' + actionId + '\')">' + steps[j]['name'] +'</a>';      
    }  
    return '<div class="list-group">' + buttons + '</div>'    
  }
}

/**
 * Taking the actionId (co-ordinates), find the step info and load it up.
 */
function openEditor(actionId) {
  var coordinates = actionIdToStep(actionId);

  var stepInfo = fetchStep(coordinates, pipeline);
  var editorModule = editorModules[stepInfo['type']];
   
  var editorHtml = editorModule.renderEditor(stepInfo, actionId); 
  var editPanel = $('#editor-panel');
  editPanel.empty();
  //console.log(template);
  var saveButton = '<button type="button" class="btn btn-default" onClick="javascript:handleEditorSave(\'' + actionId + '\')">Save</button>';
  editPanel.append("<form>" + editorHtml + saveButton + "</form>");    
  
  var stageInfo = pipeline[coordinates[0]];
  $('#editor-heading').text(stageInfo['name'] + " / " + stepInfo['name']);
}

function handleEditorSave(actionId) {
  var currentStep = fetchStep(actionIdToStep(actionId), pipeline);
  var edModule = editorModules[currentStep['type']];
  if (edModule.readChanges(actionId, currentStep)) {
      drawPipeline();
  }
  printDebugScript();
}

/**
 * an actionId is something like stage-1-2 or stage-1-2-3
 * This will return an array of the step co-ordinates.
 * So stage-1-2 = [1,2]
 *    stage-1-2-3 = [1,2,3]
 * the first number is the stage index, second is the step or stream index. 
 * the third number is if it is a parallel stage (so it is [stage, stream, step]) 
 */
function actionIdToStep(actionId) {
    var elements = actionId.split('-');
    switch (elements.length) {
      case 3:
        return [parseInt(elements[1]), parseInt(elements[2])];
      case 4:
        return [parseInt(elements[1]), parseInt(elements[2]), parseInt(elements[3])];  
      default: 
        console.log("ERROR: not a valid actionId");
    }
}

/**
 * Take 2 or 3 indexes and find the step out of the pipelineData.
 */
function fetchStep(coordinates, pipelineData) {
   if (coordinates.length == 2) {
     return pipelineData[coordinates[0]]['steps'][coordinates[1]];
   } else {
     return pipelineData[coordinates[0]]['streams'][coordinates[1]]['steps'][coordinates[2]];
   }
}



/**
  * Join up the pipeline elements visually allowing for parallelism.
  * 
  * from a pipeline that looks logically like: 
  * ["stage-0", ["stage-1-0", "stage-1-1"], "stage-2"]
  * 
  * Becomes: 
  * 
  *      /[]\
  * [] --    --[]
  *      \[]/
  *  
  */
function autoJoin() {  
    Belay.off();
    var previousPils = [];    
    for (var i=0; i < pipeline.length; i++) {
      var stage = pipeline[i];
      var currentId = "stage-" + i;      
      if (!isParallelStage(stage)) {      
        joinWith(previousPils, currentId);      
        previousPils = [currentId];      
      } else {      
        var currentPils = [];
        for (j = 0; j < stage.streams.length; j++) {
          currentPils[j] = currentId + "-" + j;                
        }
        for (var j=0; j < stage.streams.length; ++j) {
            joinWith(previousPils, currentPils[j]);
        }
        previousPils = currentPils;              
      }
    }    
}

/**
 * Draw the connecting lines using SVG and the div ids. 
 */
function joinWith(pilList, currentId) {
  for (i = 0; i < pilList.length; i++) {
    Belay.on("#" + pilList[i], "#" + currentId);
  }
}


/**
 * Wait until the steps are expanded before joining them together again
 */
function autoJoinDelay() {
  Belay.off();
  setTimeout(function() {
    autoJoin();
  }, 300);
}

/**
 * Before SVG can be used need to set it up. Only needed once per whole page refresh.
 */
function initSVG() {
  Belay.init({strokeWidth: 2});
  Belay.set('strokeColor', '#999');
}

/**
  * Templating in a few bytes eh.
  */
function renderTemplate(template, values, moreValues) {
  var result = template;
  for (key in values) {    
    result = result.split("{{" + key + "}}").join(values[key]);    
  }
  if (moreValues) {
    for (key in moreValues) {
      result = result.split("{{" + key + "}}").join(moreValues[key]);    
    }
  }
  return result;
}


/**
 * a parallel stage has to have streams
 */
function isParallelStage(stage) {
  if (stage.streams && stage.streams.length > 0) {
    return true;
  } else {
    return false;
  }
}



/**
 * Print out the workflow script using the given modules to render the steps. 
 */ 
function toWorkflow(pipelineData, modules) {
  function toStreams(streamData, modules) {
    var par = "\n    parallel (";  
    for (var i = 0; i < streamData.length; i++) {
        var stream = streamData[i];
        par += '\n     "' + stream['name'] + '" : {';
        par += toSteps(stream.steps, modules);      
        if (i == (streamData.length - 1)) {
            par += "\n     }"
        } else {
            par += "\n     },"
        }
    }
    return par + "\n    )"; 
  }

  function toSteps(stepData, modules) {
    var steps = "";
    for (var i = 0; i < stepData.length; i++) {
      var stepInfo = stepData[i];  
      var mod  = modules[stepInfo['type']];
      steps += "\n        " + mod.generateScript(stepInfo);
    }
    return steps;
  }

  var inner = "";
  for (i = 0; i < pipelineData.length; i++) {
    var stage = pipelineData[i];
    inner += '\n    stage name: "' + stage['name'] + '"';
    if (stage.streams) {      
      inner += toStreams(stage.streams, modules);
    } else {
      inner += toSteps(stage.steps, modules);
    }
  }  
  return "node {" + inner + "\n}";  
}




exports.yeah = function() {
  console.log('hey222');
  var confEditor = $('#page-body > div');
  confEditor.hide();
};
