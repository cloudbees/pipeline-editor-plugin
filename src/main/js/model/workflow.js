/**
 * Contains magic for rendering out to workflow script from the json model.
 * 
 * In some places we use the convention "stageId" style string to point to what stage we are talking about. This stage id is of the form: 
 *     stage-X for a "normal" stage. and stage-X-Y to specity the stream in a parallel stage.
 * In some places we use actionId. This is the coordinates to a step. 
 *     stage-0-0 wll indicate it is the first step of the first stage. 
 *     stage-0-0-0 will indicate it is the first step of the first stream of the first stage. 
*       ie stage-<stage>-<step> if normal. stage-<stage>-<stream>-<step> if it has parallel.
 */

exports.isParallelStage = isParallelStage;
exports.toWorkflow = toWorkflow;
exports.insertStep = insertStep;
exports.stageIdToCoordinates = stageIdToCoordinates;

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
 * take the pipeLineData model and insert the newStep at the end of the stage.
 * A stage may be stage-0 or stage-1-1, for example (latter if it is a multi stream stage)
 */
function insertStep(pipelineData, stageId, newStep) {
  var coords = stageIdToCoordinates(stageId);
  var steps = [];
  if (coords.length === 1) {
    steps = pipelineData[coords[0]].steps;
  } else {
    steps = pipelineData[coords[0]].streams[coords[1]].steps;
  }
  steps.push(newStep);
  return stageId + "-" + (steps.length - 1);
}


/** 
 * ["stage-0"] -> [0]
 * ["stage-1-1"] -> [1,1]
 */
function stageIdToCoordinates(stageId) {
  var elements = stageId.split('-');
  switch (elements.length) {
    case 2:
      return [parseInt(elements[1])];
    case 3:
      return [parseInt(elements[1]), parseInt(elements[2])];
    default: 
      console.log("ERROR: not a valid stageId");
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
        par += '\n     "' + stream.name + '" : {';
        par += toSteps(stream.steps, modules);      
        if (i === (streamData.length - 1)) {
            par += "\n     }";
        } else {
            par += "\n     },";
        }
    }
    return par + "\n    )"; 
  }

  function toSteps(stepData, modules) {
    var steps = "";
    for (var i = 0; i < stepData.length; i++) {
      var stepInfo = stepData[i];  
      var mod  = modules[stepInfo.type];
      steps += "\n        " + mod.generateScript(stepInfo);
    }
    return steps;
  }

  var inner = "";
  for (var i = 0; i < pipelineData.length; i++) {
    var stage = pipelineData[i];
    inner += '\n    stage name: "' + stage.name + '"';
    if (stage.streams) {      
      inner += toStreams(stage.streams, modules);
    } else {
      inner += toSteps(stage.steps, modules);
    }
  }  
  return "node {" + inner + "\n}";  
}
