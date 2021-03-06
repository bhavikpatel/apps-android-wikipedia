var parseCSSColor = require("../lib/js/css-color-parser");
var bridge = require("./bridge");
var loader = require("./loader");

function invertColorProperty( el, propertyName ) {
	var property = el.style[propertyName];
	console.log( JSON.stringify( parseCSSColor ) );
	var bits = parseCSSColor( property );
	if ( bits === null ) {
		// We couldn't parse the color, nevermind
		return;
	}
	var r = parseInt( bits[0] ), g = parseInt( bits[1] ), b = parseInt( bits[2] );
	el.style[propertyName] = 'rgb(' + (255 - r) + ', ' + (255 - g) + ', ' + (255 - b ) + ')';
}

function hasAncestor( el, tagName ) {
	if ( el.tagName === tagName) {
		return true;
	} else {
		if ( el.parentNode !== null && el.parentNode.tagName !== 'BODY' ) {
			return hasAncestor( el.parentNode, tagName );
		} else {
			return false;
		}
	}
}

var invertProperties = [ 'color', 'background-color', 'border-color' ];
function invertOneElement( el ) {
	var shouldStrip = hasAncestor( el, 'TABLE' );
	for ( var i = 0; i < invertProperties.length; i++ ) {
		if ( el.style[invertProperties[i]] ) {
			if ( shouldStrip ) {
				el.style[invertProperties[i]] = 'inherit';
			} else {
				invertColorProperty( el, invertProperties[i] );
			}
		}
	}
}

function invertElement( el ) {
    // first, invert the colors of tables and other elements
	var allElements = el.querySelectorAll( '*[style]' );
	for ( var i = 0; i < allElements.length; i++ ) {
		invertOneElement( allElements[i] );
	}
    // and now, look for Math formula images, and invert them
    var mathImgs = el.querySelectorAll( "[class*='math-fallback']" );
    for ( i = 0; i < mathImgs.length; i++ ) {
        var mathImg = mathImgs[i];
        // KitKat and higher can use webkit to invert colors
        if (window.apiLevel >= 19) {
            mathImg.style.cssText = mathImg.style.cssText + ";-webkit-filter: invert(100%);";
        } else {
            // otherwise, just give it a mild background color
            mathImg.style.backgroundColor = "#ccc";
            // and give it a little padding, since the text is right up against the edge.
            mathImg.style.padding = "2px";
        }
    }
}

function toggle( nightCSSURL, hasPageLoaded ) {
	window.isNightMode = !window.isNightMode;

	// Remove the <style> tag if it exists, add it otherwise
	var nightStyle = document.querySelector( "link[href='" + nightCSSURL + "']" );
	console.log( nightCSSURL );
	if ( nightStyle ) {
		nightStyle.parentElement.removeChild( nightStyle );
	} else {
		loader.addStyleLink( nightCSSURL );
	}

	if ( hasPageLoaded ) {
		// If we are doing this before the page has loaded, no need to swap colors ourselves
		// If we are doing this after, that means the transforms in transformers.js won't run
		// And we have to do this ourselves
		invertElement( document.querySelector( '.content' ) );
	}
}

bridge.registerListener( 'toggleNightMode', function( payload ) {
	toggle( payload.nightStyleBundle.style_paths[0], payload.hasPageLoaded );
} );

module.exports = {
	invertElement: invertElement
};
