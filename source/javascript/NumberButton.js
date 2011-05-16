enyo.kind({
	name: "Spaz.NumberButton",
	kind: enyo.Button,
	published: {
		number: "",
	},
	components: [
		{name: "number", className: "enyo-button-icon", showing: false},
		{name: "caption", className: "enyo-button-icon-text", style: "font-size: 10px"}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.numberChanged();
	},
	numberChanged: function(inOldValue) {
		if(this.number !== undefined && !isNaN(this.number)){
			this.$.number.setShowing(Boolean(this.number));		
			this.$.number.setContent(this.number)
		}
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
		this.$.caption.setShowing(this.caption);
	}
});
