/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control with previous and next buttons to the left and right of a content area, which can contain
other controls. The onPrevious and onNext events fire when the respective buttons are clicked.
*/
enyo.kind({
	name: "enyo.PrevNextBanner", 
	published: {
		previousDisabled: false,
		nextDisabled: false
	},
	events: {
		onPrevious: "",
		onNext: ""
	},
	kind: enyo.HFlexBox,
	align: "center",
	chrome: [
		{name: "previous", className: "enyo-banner-prev", kind: enyo.CustomButton, onclick: "doPrevious"},
		{name: "client", flex: 1, kind: enyo.HFlexBox, align: "center", className: "enyo-banner-content"},
		{name: "next", className: "enyo-banner-next", kind: enyo.CustomButton, onclick: "doNext"}
	],
	//* @protected
	create: function() {
		this.addClass('enyo-prev-next-banner');
		this.inherited(arguments);
		this.contentChanged();
		this.nextDisabledChanged();
		this.previousDisabledChanged();
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	},
	_disabledChanged: function(inControl, inDisabled) {
		inControl.setDisabled(inDisabled);
	},
	nextDisabledChanged: function() {	
		this._disabledChanged(this.$.next, this.nextDisabled);
	},
	previousDisabledChanged: function() {
		this._disabledChanged(this.$.previous, this.previousDisabled);
	}
});
