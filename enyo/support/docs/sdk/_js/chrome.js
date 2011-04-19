var G = {
	nav: null,
	currentNode: null,
	doc: null,
	iframe: false
}

$( document ).ready( function() {
	var testDoc = $( "#toc" ).find( "a" ).first().attr( "href" );
	$.get( testDoc, function( data ) {
		if ( !data ) {
			//alert( "No AJAX" );
			G.iframe = true;
			$( "#doc" ).replaceWith( '<iframe name="doc" id="doc"></iframe>' );
		} else {
			$( document ).click( handleDocClick );
		}
		G.nav = $( "#nav" );
		$( G.nav ).find( "a" ).click( handleNavClick );
		$( window ).hashchange( loadDocFromHash );
		loadDocFromHash();
	} );
} );

function loadDocFromHash() {
	var doc, tocNode;
	if ( location.hash ) {
		doc = unescape( location.hash.substr( 1 ) );
		var docLink = $( "#nav a[ href=\"" + doc + "\"]" ).first();
		tocNode = docLink.parent();
	} else {
		var firstTocLink = $( "#toc" ).find( "a" ).first();
		tocNode = firstTocLink.parent();
		doc = firstTocLink.attr( "href" );
	}
	G.doc = doc;
	setCurrent( tocNode );
	if ( G.iframe )
	{
		if( frames[ "doc" ].location !== doc ) {
			frames[ "doc" ].location = doc;
		}
	} else {
		loadDoc( doc );
	}
}

function loadDoc( doc ) {
	$.get( doc, function( data ) {
		var match = data.match( /<body>[\s\n]*(<div id="content">[\s\S]*<\/div>)[\s\n]*<\/body>/ );
		//alert( match[ 1 ] );
		$( "#doc" ).html( match[ 1 ] );

		var hashStart = doc.indexOf( "#" );
		var pos = 0;
		if ( hashStart !== -1 ) {
			var anchorId = doc.substr( hashStart ).replace( /(:|\.)/g, "\\$1" );
			pos = $( anchorId ).offset().top - 10;
		}
		$( window ).scrollTop( pos );
		
		var pathPrefix = "";
		var lastSlash = doc.lastIndexOf( "/" );
		if ( lastSlash ) {
		    pathPrefix = doc.substr( 0, lastSlash + 1 );
		}
		
		$( "#doc" ).find( "img" ).each( function() {
		    var src = $( this ).attr( "src" );
		    if ( src && src.indexOf( "://" ) == -1 ) {
		        $( this ).attr( "src", adjustPath( src, pathPrefix ) );
		    }
		} );
		
		$( "#doc" ).find( "a" ).each( function() {
		    var href = $( this ).attr( "href" );
		    if ( href && href.indexOf( "://" ) == -1 ) {
		        $( this ).attr( "href", adjustPath( href, pathPrefix ) );
		    }
		} );
		
		/*$( "#doc" ).find( "a" ).not( "a[ href*='://' ]" ).each( function() {
		    var href = adjustPath( $( this ).attr( "href" ), pathPrefix );
		    $( this ).attr( "href", href );
		} );*/
	} );
}

function adjustPath( path, prefix ) {
    if ( path.indexOf( "#" ) == 0 || path.indexOf( "../" ) == 0 ) {
        return path;
    } else if ( path.indexOf( "/" ) == 0 ) {
        return path.substr( 1 );
    } else {
        return prefix + path;
    }
}

function showNode( n ) {
	$( n ).show().addClass( "hilite" );
	$( n ).parents( "#toc li, #toc ul" ).show().addClass( "hilite" );
	$( n ).siblings().show();
	$( n ).children( "ul" ).show().addClass( "hilite" ).children( "li" ).show().addClass( "hilite" );
	showTopLevelNodes();
}

function hideNode( n ) {
	$( n ).find( "ul, li" ).hide().removeClass( "hilite" );
	$( n ).siblings().hide();
	$( n ).parents( "#toc li, #toc ul" ).hide().removeClass( "hilite" );
	$( n ).hide().removeClass( "hilite" );
	showTopLevelNodes();
}

function showTopLevelNodes() {
	$( "#toc" ).children( "li" ).show();
}

function setCurrent( el ) {
	if ( G.currentNode ) {
		$( G.currentNode ).removeClass( "current" );
		hideNode( G.currentNode );
	}
	$( el ).addClass( "current" );
	showNode( el );
	G.currentNode = el;
}

function handleNavClick() {
	var doc = $( this ).attr( "href" );
	if ( G.iframe ) {
		var tocNode = $( this ).parent();
		setCurrent( tocNode );
		return true;
	} else {
		location.hash = "#" + doc;
		return false;
	}
}

function handleDocClick( e ) {
	var t = e.target;
	if( t.nodeName.match( /^[aA]$/ ) ) {
		if ( t.host ) {
			$( t ).attr( "target", "_blank" );
			return true;
		} else {
			var h = t.attributes.getNamedItem( "href" ).nodeValue;
			//alert( h );
			if ( h.match( /^#/ ) ) {
				var u = unescape( location.hash );
				var c = u.lastIndexOf( "#" );
				h = c == 0 ? u + h : u.substr( 0, c ) + h;
			} else {
				h = "#" + h;
			}
			var hParts = h.split( "../" );
			var docParts = G.doc.split( "/" );
			if ( hParts.length > 1 && docParts.length >= hParts.length ) {
				var a = "#";
				for ( var i = 0; i < hParts.length - 1; i++ ) {
					a += docParts[ i ];
					alert( a );
				}
				a += "/" + hParts[ hParts.length - 1 ];
				h = a;
			}
			location.hash = h;
			return false;
		}
	}
}

function updateLoc( url ) {
	alert( url );
}