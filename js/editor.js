/**
 * Draw the pipeline visualisation based on the pipeline data, including svg.
 * Current pipeline is stored in the "pipeline" variable assumed to be in scope. 
 */
function drawPipeline() {  
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


/**
 * For debug purposes only. 
 */ 
function printDebugScript() {
  var editPanel = $('#workflow-debug-script');
  editPanel.empty();
  //console.log(template);  
  editPanel.append('<pre>' + toWorkflow(pipeline, editorModules) + '</pre>');    
}





  
