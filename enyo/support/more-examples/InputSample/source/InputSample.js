/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "InputSample",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, components: [
				{content: "Input Methods"},
				{content: "Press it, Pinch it, Move it, Flick it", style: "font-size: 14px"}
			]},
			{kind: "Button", caption: "Back", onclick: "backHandler"}
		]},
		{kind: "SlidingPane", flex: 1, wideWidth: 300, components: [
			{name: "left", components: [
				{name: "pane", kind: "Pane", flex: 1, onCreateView: "paneAddView", components: [
					{kind: "Main", className: "enyo-bg"}
				]}
			]},
			{name: "pullout", fixedWidth: true, style: "z-index: 1000", components: [
				{kind: "HFlexBox", flex: 1, components: [
					{kind: "Spacer", width: "50px"},
					{flex: 1, kind: "Scroller",  width: "400px", components: [
						{style: "padding: 8px;", components: [
							{name: "notes", style: "font-size: 12px; white-space: pre-wrap"},
							{name: "code", flex: 1, style: "font-size: 12px; white-space: pre-wrap"}
						]}
					]}
				]},
				{kind: "Toolbar", components: [
					{slidingHandler: true, kind: "GrabButton"}
				]}
			]}
		]}
	],
	rendered: function() {
		this.inherited(arguments);
		this.adjustSlidingSize();
	},
	resizeHandler: function() {
		this.adjustSlidingSize();
		var v = this.$.pane.view;
		if (v && v.resizeHandler) {
			v.resizeHandler();
		}
	},
	adjustSlidingSize: function() {
		var s = enyo.fetchControlSize(this);
		var pcs = enyo.fetchControlSize(this.$.pullout.$.client);
		this.$.left.node.style.width = (s.w - 46) + "px";
		this.$.pullout.setPeekWidth(s.w - pcs.w);
	},
	setView: function(inKind) {
		var n = inKind.replace(/\./g, "_");
		this.$.pane.selectViewByName(n);
		var s = this.$[n + "_content"] || this.$[n];
		this.showChrome(s);
		return s;
	},
	paneAddView: function(inSender, inName) {
		var name = inName + "_content";
		var kind = inName.replace(/_/g, ".");
		var ctor = enyo.constructorForKind(kind);
		// FIXME: remove tricky view wrapping; put scrollers in views.
		if (ctor && ctor.prototype && ctor.prototype.noScroller) {
			return {name: inName, kind: kind, className: "enyo-bg"};
		}
		// wrap content in scrollers
		return {kind: "Scroller", name: inName, className: "enyo-bg", components: [{name: name, kind: kind}]};
	},
	showChrome: function(inControl) {
		this.$.notes.setShowing(inControl.notes);
		inControl.notes && this.$.notes.setContent("<h3>Notes:</h3>" + inControl.notes);
		this.$.code.setContent("<h3>Chrome:</h3>" + enyo.json.stringify(inControl.chrome || inControl.kindComponents));
	},
	backHandler: function(inSender, e) {
		if (this.$.pane.getViewIndex() > 0) {
			this.$.pane.back(e);
			var c = this.$.pane.view;
			this.showChrome(c);
		}
	}
});