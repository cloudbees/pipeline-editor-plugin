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
      var stageElement = '<div class="col-md-3 outer-stage" data-stage-id="' + currentId + '"><ul class="list-unstyled">' + subStages + addStreamButton(currentId) + '</ul></div>';
      pRow.append(stageElement);      
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
  
};

/** redraw the pipeline and apply changes to the formFields in the Jenksin config page */
function redrawPipeline(pipeline, formFields) {
  exports.drawPipeline(pipeline, formFields);           
  writeOutChanges(pipeline, formFields);              
}


/** This will add a plain stage to the end of the set of stages */
function addStageButton() {    
  return require('./templates/stage-button.hbs')();
}

/** A stream is a named part of a parallel block in workflow */
function addStreamButton(stageId) {
  return require('./templates/stream-button.hbs')({stageId: stageId});
}

function addConfigStageListener(pipeline, formFields) {
  $("#pipeline-visual-editor").on('click', ".open-stage-config", function() {
      var stageId = $( this ).attr('data-stage-id');
      var stageConfigP = $("#edit-stage-popover-" + stageId);
      var popContent = require('./templates/stage-config-block.hbs')({stageId: stageId});
      stageConfigP.popover({'content' : popContent, 'html' : true});
      stageConfigP.popover('show');
      $('#toggleParallel-' + stageId).off('click').click(function() {
        wf.toggleParallel(pipeline, stageId);
        redrawPipeline(pipeline, formFields);
        stageConfigP.popover('toggle');
      });
      $('#cancelStageConfig-' + stageId).off('click').click(function () {
        stageConfigP.popover('toggle');
      });
      
  });
}

/** add a new stream (sometimes called a branch) to the end of the list of streams in a stage */
function addNewStreamListener(pipeline) {
  $("#pipeline-visual-editor").on('click', ".open-add-stream", function(){
    var stageId = $( this ).attr('data-stage-id');
    var newStreamP = $('#add-stream-popover-' + stageId);
    newStreamP.popover({'content' : newStreamBlock(stageId), 'html' : true});
    newStreamP.popover('show');      
    $('#addStreamBtn-' + stageId).off('click').click(function() {
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
    });      
  });  


  /** the popover for a new stream */
  function newStreamBlock(stageId) {
    return require('./templates/stream-block.hbs')({stageId: stageId});
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
    });
  });
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
      newStageP.popover({'content' : newStageBlock(), 'html' : true});
      newStageP.popover('show');      
      $('#addStageBtn').off('click').click(function() {
          newStageP.popover('toggle');
          var newStageName = $("#newStageName").val();
          if (newStageName !== '') {
            pipeline.push({"name" : newStageName, "steps" : []});
            redrawPipeline(pipeline, formFields);
          }
      });      
  });
}

/** the popover for a new  stage */
function newStageBlock() {
   return require('./templates/stage-block.hbs')();
}


/** apply changes to any form-control elements */
function addApplyChangesHooks(pipeline, formFields) {
   $(".form-control").change(function() {
     var actionId = $("#currently-editing").attr('data-action-id');     
     handleEditorSave(pipeline, actionId, formFields);
   });   
}

/**
 * For the given pipeline, put the values in the script and json form fields.
 */ 
function writeOutChanges(pipeline, formFields) {
    formFields.script.val(wf.toWorkflow(pipeline, steps));
    formFields.json.val(stringify.writeJSON(pipeline));
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
      currentId: stageId,
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
  var coordinates = wf.actionIdToStep(actionId);

  var stepInfo = wf.fetchStep(coordinates, pipeline);
  var editorModule = steps[stepInfo.type];
   
  var editorHtml = editorModule.renderEditor(stepInfo, actionId); 
  var editPanel = $('#editor-panel');
  editPanel.empty();
  editPanel.append("<form id='currently-editing' data-action-id='" + actionId + "'>" + editorHtml + "</form>");    
  
  var stageInfo = pipeline[coordinates[0]];
  $('#editor-heading').text(stageInfo.name + " / " + stepInfo.name);
  
  addApplyChangesHooks(pipeline, formFields);
    
  $(".open-editor[data-action-id='" + actionId + "']").focus();
}

/**
 * When a change is made to a step config, this will be called to apply the changes.
 */
function handleEditorSave(pipeline, actionId, formFields) {
  var currentStep = wf.fetchStep(wf.actionIdToStep(actionId), pipeline);
  var edModule = steps[currentStep.type];
  if (edModule.readChanges(actionId, currentStep)) {
      console.log("applied changes for " + actionId);
      //exports.drawPipeline(); -- don't want to do this as it collapses the step listing.
      //TODO: make it just update the step name in the view 
      writeOutChanges(pipeline, formFields);
  }
}
