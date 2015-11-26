
var storage = require("../../main/js/model/json");
var assert = require("assert");


describe('json storage basics', function() {  
      it('should default pipeline', function () {
          assert.deepEqual(storage.simpleSample, storage.loadModelOrUseDefault(""));
          assert.deepEqual(storage.simpleSample, storage.loadModelOrUseDefault(null));
       }); 
       it('should load the pipeline', function () {
           assert.deepEqual([], storage.loadModelOrUseDefault("[]"));           
        });        
      }      
    );   
