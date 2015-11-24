/**
  * Templating in a few bytes eh.
  */
exports.renderTemplate = function(template, values, moreValues) {
  var result = template;
  var key;
  for (key in values) {    
    result = result.split("{{" + key + "}}").join(values[key]);    
  }
  if (moreValues) {
    for (key in moreValues) {
      result = result.split("{{" + key + "}}").join(moreValues[key]);    
    }
  }
  return result;
};
