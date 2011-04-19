/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
easeOutBounce = function(inValue, inAnimation) {
	var a = inAnimation;
	return easeOutBounce.step(a.t1-a.t0, 0, 1, a.duration); 
}

// http://plugins.jquery.com/files/jquery.easing.1.2.js.txt
// t: current time, b: beginning value, c: change in value, d: duration
easeOutBounce.step = function (t, b, c, d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}

enyo.kind({
	name: "enyo.CanonPopup",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Some popups"},
		{kind: "Animator", onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{kind: "Button", caption: "Open Popup", onclick: "openPopup", popup: "popup"},
		{kind: "Button", caption: "Open Animated Popup", onclick: "openPopup", popup: "animatedPopup"},
		{kind: "Button", caption: "Open Transitioning Popup", onclick: "openPopup", popup: "transitioningPopup"},
		{kind: "Button", caption: "Open Dialog", onclick: "openDialog"},
		{kind: "Button", caption: "Open Fancy Popup", onclick: "openFancyPopup"},
		{kind: "Popup", scrim: true, modal: true, width: "400px", components: [
			{kind: "CanonPasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "animatedPopup", kind: "Popup", showHideMode: "manual", onOpen: "animateOpen", onClose: "animateClose",
			scrim: true, modal: true, className: "fastAnimate", width: "400px", components: [
			{kind: "CanonPasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "transitioningPopup", kind: "Popup", showHideMode: "transition", openClassName: "scaleFadeIn", scrim: true, 
			modal: true, className: "fastAnimate transitioner", width: "400px", components: [
			{kind: "CanonPasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "confirmPasswordPopup", kind: "Popup", scrim: true, components: [
			{content: "Your password is:"},
			{name: "passwordDisplay"}
		]},
		{kind: "Dialog", components: [
			{kind: "CanonPasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "fancyPopup", kind: "Popup", showHideMode: "transition", openClassName: "rotateFadeIn", 
			className: "fastAnimate transitioner2", layoutKind: "VFlexLayout",
			style: "overflow: hidden", width: "75%", height: "75%", components: [
			{kind: "CanonFancySliding", flex: 1}
		]},
		{kind: "AppMenu", components: [
			{caption: "Hey, where'd it go?", components: [
				{caption: "Not here...", components: [
					{caption: "Almost...", components: [
						{caption: "Show Popup", onclick: "openPopup"}
					]}
				]}
			]}
		]},
		//{style: "height: 100px, width: 100px, background: red;", onmousehold
		{kind: "Menu", components: [
			{caption: "Foo"},
			{caption: "Bar"},
			{caption: "Bat"},
		]}
	],
	animateOpen: function(inSender) {
		if (inSender.hasNode()) {
			this.$.animator.setDuration(750);
			this.$.animator.style = inSender.node.style;
			this.$.animator.popup = inSender;
			this.$.animator.setEasingFunc(easeOutBounce);
			this.$.animator.play();
		}
	},
	animateClose: function(inSender) {
		this.$.animator.setDuration(250);
		this.$.animator.setEasingFunc(enyo.easing.easeOut);
		this.$.animator.play();
	},
	beginAnimation: function(inSender) {
		inSender.popup.setShowing(true);
	},
	stepAnimation: function(inSender, inValue, inPercent) {
		var p = inSender.popup.isOpen ? inPercent : 1 - inPercent;
		inSender.style.opacity = p;
		inSender.style.webkitTransform = "scale(" + (2 - p) +")";
	},
	endAnimation: function(inSender) {
		var popup = inSender.popup;
		popup.setShowing(popup.isOpen);
	},
	mouseholdHandler: function(inSender, inEvent) {
		this.log();
		this.$.menu.openAtEvent(inEvent);
	},
	confirmPassword: function(inSender) {
		this.closePopup(inSender);
		var password = inSender.getPassword();
		this.$.passwordDisplay.setContent(password);
		this.$.confirmPasswordPopup.openAtCenter();
	},
	closePopup: function(inSender) {
		inSender.manager.close();
	},
	openAppMenuHandler: function() {
		this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
		this.$.appMenu.close();
	},
	openPopup: function(inSender) {
		var p = this.$[inSender.popup];
		if (p) {
			p.openAtCenter();
		}
	},
	openDialog: function() {
		this.$.dialog.open();
	},
	openFancyPopup: function() {
		this.$.fancyPopup.openAtCenter();
	},
});