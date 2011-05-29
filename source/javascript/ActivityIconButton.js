enyo.kind({
	name: "Spaz.ActivityIconButton", 
	kind: "enyo.IconButton", 
	published: {
		active: false
	},
	layoutKind: "HFlexLayout",
	components: [
		{name: "icon", className: "enyo-button-icon", showing: false},
		{name: "spinner", kind: "Spinner", style: "margin-left: 15px", className: "enyo-activitybutton-spinner"}
	],
	create: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.$.spinner.setShowing(this.active);
	},
	captionChanged: function() {
		//this.$.caption.setContent(this.caption);
	}
})