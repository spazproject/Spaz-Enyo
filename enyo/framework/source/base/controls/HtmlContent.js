/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that displays HTML content defined in a web page's HTML source. Using an HtmlContent
is a convenient way to specify a large amount of HTML.

The content property of a control can be used to specify HTML content, but 
it's not desirable to place a large amount of content in a components block:

	{content: "This is some short text"}

Instead, use an HtmlContent. In an application's index.html file:

	<body>
		<div id="myContent">This could be a large chunk of HTML.</div>
	</body>

Then, in a kind's components block:

	{kind: "HtmlContent", srcId: "myContent", onLinkClick: "htmlContentLinkClick"}

HtmlContent provides special handling for links. Instead of navigating to the web page 
specified in a link when it is clicked, an onLinkClick event is generated. The second event argument is the URL
of the link:

	htmlContentLinkClick: function(inSender, inUrl) {
		// do something when the link is clicked.
		this.$.webView.setUrl(inUrl);
	}

*/
enyo.kind({
	name: "enyo.HtmlContent",
	kind: enyo.Control,
	published: {
		/** optional ID of an element in the page from which to pull HTML content.  If not set, this acts like a
		    enyo.Control which has the _allowHtml_ property set to true. */
		srcId: ""
	},
	events: {
		//* event sent when a link inside the HtmlContent is clicked
		onLinkClick: ""
	},
	allowHtml: true,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.idChanged();
	},
	idChanged: function() {
		var node = enyo.byId(this.srcId);
		if (node) {
			if (node.nodeType == 1) {
				this.setContent(node.innerHTML);
				node.style.display = "none";
			} else {
				this.setContent(node.textContent);
			}
		}
	},
	findLink: function(inNode, inAncestor) {
		var n = inNode;
		while (n && n != inAncestor) {
			if (n.href) {
				return n.href;
			}
			n = n.parentNode;
		}
	},
	clickHandler: function(inSender, inEvent) {
		var url = this.findLink(inEvent.target, this.hasNode());
		if (url) {
			this.doLinkClick(url, inEvent);
			inEvent.preventDefault();
			return true;
		} else {
			this.doClick();
		}
	}
});