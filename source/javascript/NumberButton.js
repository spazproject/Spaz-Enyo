enyo.kind({
	name: "Spaz.NumberButton",
	kind: enyo.Button,
	published: {
		number: "",
	},
	components: [
		{name: "number", className: "enyo-button-number ", showing: true},
		{name: "caption", className: "enyo-button-icon-text", style: "font-size: 11px"}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.numberChanged();
	},
	numberChanged: function(inOldValue) {
		if(!isNaN(this.number)){
			this.$.number.setContent(this.number)
		} else {
			this.$.number.setContent(0)			
		}
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
		this.$.caption.setShowing(this.caption);
	}
});
