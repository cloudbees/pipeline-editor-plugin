/**
 * Editor modules for the built in steps.
 * This just wraps up the editor modules in this directory
 *
 * Other plugins can register editors too:
 * They just need to do the same as the below 
 * by adding it to the window.pipelineEditors object. 
 * the installEditors function is called by the main adjunct, but it doesn't really matter
 * where it is called from, as long as they are installed before they are needed.
 */

var editorModules = {
  "sh" : require('./shell').editor,
  "git" : require('./git').editor,
  "stash" : require('./stash').editor,
  "rick" : require('./rick').editor  
};

exports.installEditors = function() {
  if (!window.pipelineEditors) {
      window.pipelineEditors = {};
  } 
  for (var ed in editorModules) {
    window.pipelineEditors[ed] = editorModules[ed];
  }  
};
