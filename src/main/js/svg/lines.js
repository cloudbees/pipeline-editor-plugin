var Belay = require('./svg');
var wf = require('../model/workflow');

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
function autoJoin(pipeline) {  
    Belay.off();
    var previousPils = [];    
    for (var i=0; i < pipeline.length; i++) {
      var stage = pipeline[i];
      var currentId = "stage-" + i;      
      if (!wf.isParallelStage(stage)) {      
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

exports.autoJoin = autoJoin;


/**
 * Draw the connecting lines using SVG and the div ids. 
 */
function joinWith(pilList, currentId) {
  for (var i = 0; i < pilList.length; i++) {
    Belay.on("#" + pilList[i], "#" + currentId);
  }
}


/**
 * Wait until the steps are expanded before joining them together again
 */
exports.autoJoinDelay = function(pipeline) {
  Belay.off();
  setTimeout(function() {
    autoJoin(pipeline);
  }, 500);
};

/**
 * Before SVG can be used need to set it up. Only needed once per whole page refresh.
 */
exports.initSVG = function() {
  Belay.init({strokeWidth: 2});
  Belay.set('strokeColor', '#999');
};
