/**
 * Awful hack to get around JSONifying things with Prototype taking over wrong. ugh. Prototype is the worst.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 * Bootstrap is bad and you should feel bad.
 */
exports.writeJSON = function(o) {
	if(Array.prototype.toJSON) { // Prototype f's this up something bad
		var protoJSON = {
			a: Array.prototype.toJSON,
			o: Object.prototype.toJSON,
			h: Hash.prototype.toJSON,
			s: String.prototype.toJSON
		};
	    try {
	        delete Array.prototype.toJSON;
  	    	delete Object.prototype.toJSON;
	        delete Hash.prototype.toJSON;
	        delete String.prototype.toJSON;
	        
	    	return JSON.stringify(o);
	    }
	    finally {
	    	if(protoJSON.a) {
	    		Array.prototype.toJSON = protoJSON.a;
	    	}
	    	if(protoJSON.o) {
	    		Object.prototype.toJSON = protoJSON.o;
	    	}
	    	if(protoJSON.h) {
	    		Hash.prototype.toJSON = protoJSON.h;
	    	}
	    	if(protoJSON.s) {
	    		String.prototype.toJSON = protoJSON.s;
	    	}
	    }
	}
	else {
		return JSON.stringify(o);
	}
};
