/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that shows the current progress of a process in a horizontal bar. By default, it animates progress changes.

	{kind: "ProgressBar"}
	{kind: "ProgressBar", animationPosition: false}

See <a href="#enyo.Progress">Progress</a> for usage examples.
*/
enyo.kind({
	name: "enyo.ProgressBar",
	kind: enyo.Progress,
	className: "enyo-progress-bar",
	published: {
		/** Controls whether progress changes are animated. */
		animatePosition: true
	},
	events: {
		onBeginAnimation: "",
		onEndAnimation: ""
	},
	chrome: [
		{name: "animator", kind: enyo.Animator, onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation", onStop: "stopAnimation"},
		{name: "bar", className: "enyo-progress-bar-inner"},
		{name: "client"}
	],
	create: function() {
		this.inherited(arguments);
		this.contentChanged();
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	},
	//* @protected
	setPositionImmediate: function(inPosition) {
		var ap = this.animatePosition;
		this.animatePosition = false;
		this.setPosition(inPosition);
		this.animatePosition = ap;
	},
	applyPosition: function() {
		var p = this.calcPercent(this.position);
		if ((this.lastPosition >= 0) && this.animatePosition && !this.$.animator.isAnimating() && this.canAnimate()) {
			this.$.animator.play(this.calcPercent(this.lastPosition), p);
		} else {
			this.renderPosition(p);
		}
	},
	renderPosition: function(inPercent) {
		this.$.bar.applyStyle("visibility", inPercent <= 0 ? "hidden" : "visible");
		this.$.bar.applyStyle("width",  inPercent + "%");
	},
	renderPositionDirect: function(inDomStyle, inPercent) {
		inDomStyle.visibility = inPercent <= 0 ? "hidden" : "visible";
		inDomStyle.width = inPercent + "%";
	},
	canAnimate: function() {
		return this.$.bar.hasNode();
	},
	beginAnimation: function(inSender, inStart, inEnd) {
		this.$.bar.domStyles.visibility = inEnd <= 0 ? "hidden" : "visible";
		this.$.bar.domStyles.width = inEnd + "%";
		if (this.$.bar.hasNode()) {
			inSender.style = this.$.bar.node.style;
			this.doBeginAnimation();
		}
	},
	stepAnimation: function(inSender, inValue) {
		this.renderPositionDirect(inSender.style, inValue);
	},
	endAnimation: function(inSender, inValue) {
		this.completeAnimation(inSender, inValue);
	},
	stopAnimation: function(inSender, inValue, inStart, inEnd) {
		this.completeAnimation(inSender, inEnd);
	},
	completeAnimation: function(inSender, inValue) {
		this.renderPositionDirect(inSender.style, inValue);
		this.doEndAnimation();
	},
	forceBeginAnimation: function(inStart, inEnd) {
		this.beginAnimation(this.$.animator, inStart, inEnd);
	},
	forceStepAnimation: function(inValue) {
		this.stepAnimation(this.$.animator, inValue);
	},
	forceCompleteAnimation: function(inValue) {
		this.completeAnimation(this.$.animator, inValue);
	}
});
