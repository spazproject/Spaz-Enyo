/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A fixed width <a href="#enyo.Menu">Popup</a>, with a header, and should be used as an interactive dialog box.

		{kind: "ModalDialog", caption: "Dialog Title"}
*/

enyo.kind({
	name: "enyo.ModalDialog",
	kind: enyo.Popup,
	className: "enyo-popup enyo-modaldialog",
	scrim: true,
	modal: true,
	dismissWithClick: false,
	published: {
		caption: "",
		/**
			Height to apply to the content of the popup. Specify when the popup's content should
			be explicitly rather than naturally sized.
		*/
		contentHeight: "",
		/**
			A css class name to apply to the content of the popup.
		*/
		contentClassName: ""
	},
	chrome: [
		{className: "enyo-modaldialog-container", components: [
			{name: "modalDialogTitle", className: "enyo-modaldialog-title"},
			{name: "client", className: "enyo-modaldialog-content"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.caption = this.caption || this.label || this.content;
	},
	// size is clamped via the client region so that client size can be dynamic
	calcContentSizeDelta: function() {
		var r = this.inherited(arguments);
		this.beginMeasureSize();
		var n = this.hasNode();
		var cn = this.$.client.hasNode();
		// adjust by client's node offset.
		var o = enyo.dom.calcNodeOffset(cn, n);
		// and offset by border
		var b = enyo.dom.calcBorderExtents(n);
		var d = o.top - b.t;
		r.height += d;
		this.finishMeasureSize();
		return r;
	},
	componentsReady: function() {
		this.inherited(arguments);
		this.contentHeightChanged();
		this.contentClassNameChanged();
		this.layoutKindChanged();
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.modalDialogTitle.setContent(this.caption);
	},
	contentHeightChanged: function() {
		this.$.client.applyStyle("height", this.contentHeight || null);
	},
	contentClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.client.removeClass(inOldValue);
		}
		this.$.client.addClass(this.contentClassName);
	},
	layoutKindChanged: function() {
		if (this.$.client) {
			this.$.client.align = this.align;
			this.$.client.pack = this.pack;
			this.$.client.setLayoutKind(this.layoutKind);
		}
	}
});
