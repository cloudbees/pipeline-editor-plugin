/**
 * Contains magic for rendering out to workflow script from the json model.
 */

exports.isParallelStage = isParallelStage;
exports.toWorkflow = toWorkflow;

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
