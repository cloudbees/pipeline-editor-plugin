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
exports.actionIdToStep = actionIdToStep;
exports.fetchStep = fetchStep;
exports.parallelToNormal = parallelToNormal;
exports.makeParallel = makeParallel;
exports.toggleParallel = toggleParallel;
exports.removeActionId = removeActionId;
exports.removeStage = removeStage;

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
  var stepContainer;
  if (coords.length === 1) {
    stepContainer = pipelineData[coords[0]];
  } else {
    stepContainer = pipelineData[coords[0]].streams[coords[1]];
  }
  stepContainer.steps.push(newStep);
  return {
    actionId: stageId + "-" + (stepContainer.steps.length - 1),
    stepContainer: stepContainer
  };
}


/** 
 * get the array coordinates of a stage
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

/** Toggle the parallel-ness of a stage */
function toggleParallel(pipeline, stageId) {
  var coords = stageIdToCoordinates(stageId);
  if (isParallelStage(pipeline[coords[0]])) {
    parallelToNormal(pipeline, stageId);
  } else {
    makeParallel(pipeline, stageId);
  }
}

/**
 * Convert a stage that is already parallel, to one that is normal, but combining the streams. 
 */
function parallelToNormal(pipeline, stageId) {
    var coords = stageIdToCoordinates(stageId);
    var stage = pipeline[coords[0]];    
    var streams = stage.streams;    
    var newSteps = streams.reduce(function(acc, val){
      return acc.concat(val.steps);
    }, []);    
    delete stage.streams;
    stage.steps = newSteps;
}

/**
 * Take a normal stage which is a list of steps, and split it evenly to parallel streams. 
 * Use the name of the first steps as the stream name. 
 */
function makeParallel(pipeline, stageId) {
   var coords = stageIdToCoordinates(stageId);
   var stage = pipeline[coords[0]];    
   var steps = stage.steps;
   
   var splitAt = Math.floor(steps.length/2);
   var leftSteps = [];
   var rightSteps = [];
   for (var i=0; i < steps.length; ++i) {
     if (i < splitAt) {
       leftSteps.push(steps[i]);
     } else {
       rightSteps.push(steps[i]);
     }
   }
   var leftName = '';
   var rightName = '';   
   if (leftSteps[0]) {
     leftName = leftSteps[0].name;
   }
   if (rightSteps[0]) {
     rightName = rightSteps[0].name;
   }
   
   delete stage.steps;
   stage.streams = [
     {"name" : leftName, "steps" : leftSteps},
     {"name" : rightName, "steps" : rightSteps}
   ];
   
}

/** 
 * given an action id like stage-1-2 - remove it from the pipeline
 */
function removeActionId(pipeline, actionId) {
   var coords = actionIdToStep(actionId);
   if (coords.length === 2) {
     pipeline[coords[0]].steps.splice(coords[1], 1);
   } else {
     pipeline[coords[0]].streams[coords[1]].steps.splice(coords[2], 1);
   }
}

/** Remove a whole stage */
function removeStage(pipeline, stageId) {
    var coords = stageIdToCoordinates(stageId);
    if (coords.length === 1) {
      pipeline.splice(coords[0], 1);
    } else {
      pipeline[coords[0]].streams.splice(coords[1], 1);
    }
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
   if (coordinates.length === 2) {
     return pipelineData[coordinates[0]].steps[coordinates[1]];
   } else {
     return pipelineData[coordinates[0]].streams[coordinates[1]].steps[coordinates[2]];
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
