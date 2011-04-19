/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A progress bar that looks like a list item.

	{kind: "ProgressBarItem"}

See <a href="#enyo.Progress">Progress</a> for usage examples.
*/
enyo.kind({
	name: "enyo.ProgressBarItem",
	kind: enyo.ProgressBar,
	className: "enyo-progress-bar-item",
	create: function() {
		this.inherited(arguments);
		this.$.bar.setClassName("enyo-progress-bar-item-inner");
		this.$.client.addClass("enyo-progress-bar-item-client");
	}
});
