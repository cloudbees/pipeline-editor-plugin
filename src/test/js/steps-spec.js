var renderTemplate = require("../../main/js/steps/template.js").renderTemplate;
var assert = require("assert");


describe('Pipeline drawing', function() {
  
      it('should render a template', function () {
        assert.equal("yeah 42 yeah", renderTemplate("yeah {{something}} yeah", {"something" : 42}));        
        assert.equal("yeah {{something}} yeah", renderTemplate("yeah {{something}} yeah", {}));        
        assert.equal("yeah 2 yeah", renderTemplate("yeah 2 yeah", {"something" : 42}));        
        assert.equal("yeah 1 2", renderTemplate("yeah {{s1}} {{s2}}", {"s1" : 1, "s2": 2}));        
        assert.equal("yeah 1 2", renderTemplate("yeah {{s1}} {{s2}}", {"s1" : 1}, {"s2": 2}));        
      }); 
    }
      
    );   
