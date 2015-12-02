/**
 * Use SVG to draw lines between adjacent divs. 
 */ 

var $ = require('bootstrap-detached').getBootstrap();

var settings = {
                  strokeColor       : '#fff',
                  strokeWidth       : 10,
                  opacity           : 1,
                  fill              : 'none',
                  animate           : true,
                  animationDirection: 'right',
                  animationDuration : 0.3
               };


exports.init = function(initObj) {
    if (initObj) {
      $.each(initObj, function(index, value) {
         //TODO validation on settings
         settings[index] = value;
      });
    }
};

exports.set = function(prop, val){
  //TODO validate
  settings[prop] = val;
};

exports.on = function(el1, el2){
  var $el1 = $(el1);
  var $el2 = $(el2);
  if ($el1.length && $el2.length) {
    var svgheight,
        p,
        svgleft,
        svgtop,
        svgwidth;

    var el1pos = $(el1).offset();
    var el2pos = $(el2).offset();

    var el1H = $(el1).outerHeight();
    var el1W = $(el1).outerWidth();

    var el2H = $(el2).outerHeight();

    svgleft = Math.round(el1pos.left + el1W);
    svgwidth = Math.round(el2pos.left - svgleft);

    var cpt;

    ////Determine which is higher/lower
    if( (el2pos.top+(el2H/2)) <= ( el1pos.top+(el1H/2))){
      // console.log("low to high");        
      svgheight = Math.round((el1pos.top+el1H/2) - (el2pos.top+el2H/2));
      svgtop = Math.round(el2pos.top + el2H/2) - settings.strokeWidth;        
      cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
      p = "M0,"+ (svgheight+settings.strokeWidth) +" C"+cpt+","+(svgheight+settings.strokeWidth)+" "+(svgwidth-cpt)+"," + settings.strokeWidth + " "+svgwidth+"," + settings.strokeWidth;          
    }else{
      // console.log("high to low");
      svgheight = Math.round((el2pos.top+el2H/2) - (el1pos.top+el1H/2));
      svgtop = Math.round(el1pos.top + el1H/2) - settings.strokeWidth;  
      cpt = Math.round(svgwidth*Math.min(svgheight/300, 1));
      p = "M0," + settings.strokeWidth + " C"+ cpt +",0 "+ (svgwidth-cpt) +","+(svgheight+settings.strokeWidth)+" "+svgwidth+","+(svgheight+settings.strokeWidth);                  
    }
    
    //ugly one-liner
    var $ropebag = $('#ropebag').length ? $('#ropebag') : $('body').append($( "<div id='ropebag' />" )).find('#ropebag');

    var svgnode = document.createElementNS('http://www.w3.org/2000/svg','svg');
    var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");
    newpath.setAttributeNS(null, "d", p);
    newpath.setAttributeNS(null, "stroke", settings.strokeColor);
    newpath.setAttributeNS(null, "stroke-width", settings.strokeWidth);
    newpath.setAttributeNS(null, "opacity", settings.opacity);
    newpath.setAttributeNS(null, "fill", settings.fill);      
    svgnode.appendChild(newpath);
    //for some reason, adding a min-height to the svg div makes the lines appear more correctly.
    $(svgnode).css({left: svgleft, top: svgtop, position: 'absolute',width: svgwidth, height: svgheight + settings.strokeWidth*2, minHeight: '20px' });
    $ropebag.append(svgnode);
    if (settings.animate) {
      // THANKS to http://jakearchibald.com/2013/animated-line-drawing-svg/
      var pl = newpath.getTotalLength();
      // Set up the starting positions
      newpath.style.strokeDasharray = pl + ' ' + pl;

      if (settings.animationDirection === 'right') {
        newpath.style.strokeDashoffset = pl;
      } else {
        newpath.style.strokeDashoffset = -pl;
      }

      // Trigger a layout so styles are calculated & the browser
      // picks up the starting position before animating
      // WON'T WORK IN IE. If you want that, use requestAnimationFrame to update instead of CSS animation
      newpath.getBoundingClientRect();
      newpath.style.transition = newpath.style.WebkitTransition ='stroke-dashoffset ' + settings.animationDuration + 's ease-in-out';
      // Go!
      newpath.style.strokeDashoffset = '0';
    }
  }
};

exports.off = function(){
  $("#ropebag").empty();
};
