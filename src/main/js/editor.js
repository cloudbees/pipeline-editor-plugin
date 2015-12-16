/**
 * Pipeline editor main module. Dreaming of Alaskan pipelines 4 eva. 
 *  Elements that are to be used when actually editing should have a class of 'edit-mode'.
 *  Then we can support read only by simply $('.edit-mode').hide();
 * 
 * I Recommended that you understand the stage/step/parallel/node concepts in workflow well before looking further.
 * "Normal stage" means a normal workflow stage. A "parallel stage" is just a stage that 
 *  has a parallel set of streams (sometimes called branches) under it, as is the workflow convention.
 */

var $ = require('bootstrap-detached').getBootstrap();
var lines = require('./svg/lines');

var stringify = require('./model/stringify');
var wf = require('./model/workflow');

var steps = require('./steps');

/**
 * Draw the pipeline visualisation based on the pipeline data, including svg.
 * Current pipeline is stored in the "pipeline" variable assumed to be in scope. 
 * Also requires formFields of script and json
 */
exports.drawPipeline = function (pipeline, formFields) {  
  var pRow = $('#pipeline-row');
  pRow.empty();
  
  for (var i=0; i < pipeline.length; i++) {
    var stage = pipeline[i];
    var currentId = "stage-" + i;      
    //append a block if non parallel
    if (!wf.isParallelStage(stage)) {      
      pRow.append(normalStageBlock(currentId, stage));
    } else {      
      var subStages = "";
      for (var j = 0; j < stage.streams.length; j++) {
        var subStage = stage.streams[j];
        var subStageId = currentId + "-" + j;                
        subStages += parStageBlock(stage.name, subStageId, subStage, currentId);
      }      
      
      pRow.append(parallelStack(subStages, currentId)); 
    }
  }
  pRow.append(addStageButton());
  
  addNewStageListener(pipeline, formFields);
  addNewStreamListener(pipeline, formFields);
  
  lines.autoJoinDelay(pipeline);  
  addAutoJoinHooks(pipeline);

  addOpenStepListener(pipeline, formFields);
  addNewStepListener(pipeline, formFields);
  
  addConfigStageListener(pipeline, formFields);
  addConfigStreamListener(pipeline, formFields);
  
};

/** redraw the pipeline and apply changes to the formFields in the Jenksin config page */
function redrawPipeline(pipeline, formFields) {
  exports.drawPipeline(pipeline, formFields);           
  writeOutChanges(pipeline, formFields);              
}

/** a parallel stage is really just a stage, but with a stack of parallel streams (each which have a name) */
function parallelStack(subStages, currentId) {
  return require('./templates/parallel-stack.hbs')({subStages: subStages, addStreamButton : addStreamButton(currentId), currentId : currentId });
}

/** This will add a plain stage to the end of the set of stages */
function addStageButton() {    
  return require('./templates/stage-button.hbs')();
}

/** A stream is a named part of a parallel block in workflow */
function addStreamButton(stageId) {
  return require('./templates/stream-button.hbs')({stageId: stageId});
}

/** show a popover for changing stage level settings, or deleting */
function addConfigStageListener(pipeline, formFields) {
  $("#pipeline-visual-editor").on('click', ".open-stage-config", function() {
      var stageId = $( this ).attr('data-stage-id');
      var coords = wf.stageIdToCoordinates(stageId);
      var currentStage = pipeline[coords[0]];
      
      var stageConfigP = $("#edit-stage-popover-" + stageId);
      var popContent = require('./templates/stage-config-block.hbs')({stageId: stageId, stageName: currentStage.name});
      stageConfigP.popover({'content' : popContent, 'html' : true});
      stageConfigP.popover('show');
      $('#toggleParallel-' + stageId).off('click').click(function() {
        wf.toggleParallel(pipeline, stageId);
        redrawPipeline(pipeline, formFields);
        stageConfigP.popover('destroy');
      });
      $('#closeStageConfig-' + stageId).off('click').click(function () {
        var newName = $('#stageName_' + stageId).val();        
        if (newName !== currentStage.name) {
          currentStage.name = newName;
          redrawPipeline(pipeline, formFields);
        } 
        stageConfigP.popover('destroy');
      });
      $('#deleteStage-' + stageId).off('click').click(function() {
        if (window.confirm("Are you sure you want to delete this stage?")) {
          wf.removeStage(pipeline, stageId);
          redrawPipeline(pipeline, formFields);
          stageConfigP.popover('destroy');
        }
      });
      
      
  });
}

/** popover for changing stream settings for a parallel stage, including deleting */
function addConfigStreamListener(pipeline, formFields) {
  $("#pipeline-visual-editor").on('click', ".open-stream-config", function() {
      var stageId = $( this ).attr('data-stage-id');
      var streamId = $( this ).attr('data-stream-id');
      var coords = wf.stageIdToCoordinates(streamId);
      var currentStage = pipeline[coords[0]];
      var currentStream = currentStage.streams[coords[1]];
      
      console.log(stageId);
      var streamConfigP = $("#edit-stage-popover-" + streamId);
      var popContent = require('./templates/stream-config-block.hbs')(
          { stageId: stageId, 
            streamId: streamId, 
            stageName: currentStage.name,
            streamName: currentStage.streams[coords[1]].name
          });
      streamConfigP.popover({'content' : popContent, 'html' : true});
      streamConfigP.popover('show');
      
      $('#makeSequential-' + stageId).off('click').click(function() {
        wf.parallelToNormal(pipeline, stageId);
        redrawPipeline(pipeline, formFields);
        streamConfigP.popover('destroy');
      });
      
      $('#closeStageConfig-' + stageId).off('click').click(function () {
        var newName = $('#stageName_' + stageId).val();        
        var newStreamName = $('#streamName_' + streamId).val();        
        if (newName !== currentStage.name || newStreamName !== currentStream.name) {
          currentStage.name = newName;
          currentStream.name = newStreamName;
          redrawPipeline(pipeline, formFields);
        } 
        streamConfigP.popover('destroy');
      });
      
      $('#deleteStage-' + stageId).off('click').click(function() {
        if (window.confirm("Are you sure you want to delete the whole stage and all its parallel branches?")) {
          wf.removeStage(pipeline, stageId);
          redrawPipeline(pipeline, formFields);
          streamConfigP.popover('destroy');
        }
      });
      
      $('#deleteStream-' + streamId).off('click').click(function() {
        if (window.confirm("Are you sure you want to delete branch?")) {
          wf.removeStage(pipeline, streamId);
          redrawPipeline(pipeline, formFields);
          streamConfigP.popover('destroy');
        }
      });

      
      
  });
}


/** add a new stream (sometimes called a branch) to the end of the list of streams in a stage */
function addNewStreamListener(pipeline) {
  $("#pipeline-visual-editor").on('click', ".open-add-stream", function(){
    var stageId = $( this ).attr('data-stage-id');
    var newStreamP = $('#add-stream-popover-' + stageId);
    var newStreamBlock = require('./templates/stream-block.hbs')({stageId: stageId});
    newStreamP.popover({'content' : newStreamBlock, 'html' : true});
    newStreamP.popover('show');      
    $('#addStreamBtn-' + stageId).off('click').click(function() {
        handleAddStream(newStreamP, stageId, pipeline);
    });      
    $("#newStreamName-" + stageId).off('keydown').keydown(function (e) {
      if (e.which === 13) {
        handleAddStream(newStreamP, stageId, pipeline);
      }
    });
    $("#newStreamName-" + stageId).focus();
  });  
  
}


/** add a new stream to an existing stage and redraw just that section */
function handleAddStream(newStreamP, stageId, pipeline) {
  newStreamP.popover('toggle');
  var newStreamName = $("#newStreamName-" + stageId).val();
  if (newStreamName !== '') {
    var coords = wf.stageIdToCoordinates(stageId);
    var outerStage = pipeline[coords[0]];
    var newStream = {"name": newStreamName, "steps": []};
    outerStage.streams.push(newStream);
    // Insert the new stream stage directly into the DOM...
    var subStageId = stageId + "-" + (outerStage.streams.length - 1);
    var streamView = parStageBlock(outerStage.name, subStageId, newStream, stageId);          
    $(streamView).insertAfter(
        $(".outer-stage[data-stage-id='" + stageId + "'] ul li").last()
    );            
    lines.autoJoinDelay(pipeline, 0); // redraw immediately ... no delay
  }
}



/** We will want to redraw the joins in some cases */
function addAutoJoinHooks(pipeline) {
  $("#pipeline-visual-editor").on('click', ".autojoin", function() {
    lines.autoJoinDelay(pipeline);
  });
}

/** clicking on a step will open the editor */
function addOpenStepListener(pipeline, formFields) {
  $("#pipeline-visual-editor").on('click', ".open-editor", function(){
    openEditor(pipeline, $( this ).attr('data-action-id'), formFields);
  });
}

/** clicking on add a step should open a popover with a selection of available steps */
function addNewStepListener(pipeline, formFields) { // jshint ignore:line
  $("#pipeline-visual-editor").on('click', ".open-add-step", function(){
    var stageId = $( this ).attr('data-stage-id');
    var newStepP = $('#add-step-popover-' + stageId);
    newStepP.popover({'content' : newStepBlock(stageId, steps), 'html' : true});
    newStepP.popover('show');      
    $("#addStepBtn-" + stageId).off('click').click(function() {        
       handleAddNewStep(newStepP, pipeline, formFields, stageId);
    });
    $("#newStepName-" + stageId).off('keydown').keydown(function(e) {
      if (e.which === 13) {
        handleAddNewStep(newStepP, pipeline, formFields, stageId);
      }
    });
  });
}

/** Add the new step and redraw just the current stage listing of steps */
function handleAddNewStep(newStepP, pipeline, formFields, stageId) {
  var selected = document.querySelector('input[name="newStepType-' + stageId + '"]:checked');
  var name = $('#newStepName-' + stageId).val();
  newStepP.popover('toggle');
  if (selected) {
      if (!name) {
        name = "New Step";
      }
      var newStep = {"type": selected.value, "name": name};
      var insertResult = wf.insertStep(pipeline, stageId, newStep);
      writeOutChanges(pipeline, formFields);
      refreshStepListing(stageId, insertResult.stepContainer.steps);
      lines.autoJoinDelay(pipeline, 0); // redraw immediately ... no delay
      openEditor(pipeline, insertResult.actionId, formFields);            
  }
}

/** the popover for a new step */
function newStepBlock(stageId, pipelineEditors) {  
  return require('./templates/step-block.hbs')({
      stageId: stageId,
      steps: pipelineEditors
  });  
}

/** clicking on add a stage will at least ask a user for a name */
function addNewStageListener(pipeline, formFields) { // jshint ignore:line
  $("#pipeline-visual-editor").on('click', ".open-add-stage", function() {
    var newStageP = $('#add-stage-popover');
    newStageP.popover({'content': newStageBlock(), 'html': true});
    newStageP.popover('show');

    function addStage() {
      newStageP.popover('toggle');
      var newStageName = $("#newStageName").val();
      if (newStageName !== '') {
        pipeline.push({"name": newStageName, "steps": []});
        redrawPipeline(pipeline, formFields);
      }
    }

    $('#addStageBtn').off('click').click(function() {
      addStage();
    });
    $("#newStageName").off('keydown').keydown(function (e) {
      if (e.which === 13) {
        addStage();
      }
    });
    $("#newStageName").focus();
  });
}

/** the popover for a new  stage */
function newStageBlock() {
   return require('./templates/stage-block.hbs')();
}


/** apply changes to any form-control elements */
function addApplyChangesHooks(pipeline, formFields) {
   $(".currently-editing").change(function() {
     var actionId = $( this ).attr('data-action-id');     
     handleEditorSave(pipeline, actionId, formFields);
   });   
   $(".close-editor-popover").click(function() {
     var actionId = $( this ).attr('data-action-id');
     var editorP = $("#show-editor-popover-" + actionId);
     editorP.popover('destroy');     
   });
   $(".delete-current-step").click(function() {
     if (window.confirm("Are you sure you want to delete this step?")) {
        var actionId = $( this ).attr('data-action-id');
        var editorP = $("#show-editor-popover-" + actionId);
        wf.removeActionId(pipeline, actionId);
        redrawPipeline(pipeline, formFields);
        editorP.popover('destroy');         
     }  
     
   });
   
}

/**
 * For the given pipeline, put the values in the script and json form fields.
 */ 
function writeOutChanges(pipeline, formFields) {
    var generatedScript = wf.toWorkflow(pipeline, steps);
    formFields.script.val(generatedScript);
    formFields.json.val(stringify.writeJSON(pipeline));
    console.log(generatedScript);
}
exports.writeOutChanges = writeOutChanges;

/**
 * parallel stages are an item in an ordered list.
 */
function parStageBlock(stageName, subStageId, subStage, stageId) {
  return require('./templates/parallel-stage-block.hbs')({
      stageName: stageName,
      subStageId: subStageId,
      subStage: subStage,
      stageId: stageId,
      stepListing: stepListing(subStageId, subStage.steps)
  });
}
exports.parStageBlock = parStageBlock;
 
/**
 * A non parallel stage. Parallel stages are a pipeline editor construct, not an inherent workflow property.
 */
function normalStageBlock(currentId, stage) {
  return require('./templates/normal-stage-block.hbs')({
      currentId: currentId,
      stage: stage,
      stepListing: stepListing(currentId, stage.steps)
  });
}
exports.normalStageBlock = normalStageBlock;

/**
 * Take a list of steps and return a listing of step buttons
 */
function stepListing(stageId, steps)  {
    return require('./templates/steps-listing.hbs')({
        stageId: stageId,
        steps: steps
    });
}

function refreshStepListing(stageId, steps)  {
    var content = stepListing(stageId, steps);
    $('#' + stageId + ' .step-listing').replaceWith(content);
}

/**
 * Taking the actionId (co-ordinates), find the step info and load it up.
 */
function openEditor(pipeline, actionId, formFields) {  
  var editorP = $("#show-editor-popover-" + actionId);
  var coordinates = wf.actionIdToStep(actionId);
  var stepInfo = wf.fetchStep(coordinates, pipeline);
  var editorModule = steps[stepInfo.type];
  var editorHtml = editorModule.renderEditor(stepInfo, actionId); 
  var content = require('./templates/editor-popover.hbs')({
      actionId : actionId, 
      editorHtml: editorHtml      
  });

  editorP.popover({'content' : content, 'html' : true});
  editorP.popover('show');

  addApplyChangesHooks(pipeline, formFields);
    
  $(".open-editor").removeClass('selected');
  $(".open-editor[data-action-id='" + actionId + "']").addClass('selected');
  $('.form-group').first().focus();
  
}

/**
 * When a change is made to a step config, this will be called to apply the changes.
 */
function handleEditorSave(pipeline, actionId, formFields) {
  var currentStep = wf.fetchStep(wf.actionIdToStep(actionId), pipeline);
  var edModule = steps[currentStep.type];
  if (edModule.readChanges(actionId, currentStep)) {
      console.log("applied changes for " + actionId);
      writeOutChanges(pipeline, formFields);
  }
}
