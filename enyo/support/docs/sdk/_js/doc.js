$().ready( function() {
	if( window === window.top ) {
		var pos = window.location.href.lastIndexOf( "/docs/" );
		var pre = window.location.href.substr( 0, pos );
		var doc = window.location.href.substr( pos + 6 );
		var loc = pre + "/docs/docs.html#" + doc;
		window.location.replace( loc );
	}
	$( "a[href*='://']" ).attr( "target", "_blank" );
	//$( "a" ).not( "a[href*='://']" ).attr( "target", "_top" );
} );