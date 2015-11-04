/**
 * Test editor functionality. Designed to be run with mocha. 
 */

setup();

var assert = require("assert");

describe('Editor modules', function() {  
      it('should show sh forms', function () {
        var block = editorModules['sh'].renderEditor({"name": "yeah", "command" : 42}, "43");
        assert.notEqual(-1, block.indexOf("42"));
        assert.notEqual(-1, block.indexOf("43"));
        assert.notEqual(-1, block.indexOf("yeah"));
      });    
      
      it('should show git forms', function () {
        var block = editorModules['git'].renderEditor({"name": "yeah", "url" : 42}, "43");
        assert.notEqual(-1, block.indexOf("42"));
        assert.notEqual(-1, block.indexOf("43"));
        assert.notEqual(-1, block.indexOf("yeah"));
      });    
      
});


function setup() {
  var fs = require('fs');
  var vm = require('vm');
  var path = './editor_modules.js';
  var code = fs.readFileSync(path);
  vm.runInThisContext(code);
}
