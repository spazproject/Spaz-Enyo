/**
 * This overrides the getValue method so we get back text, even though the
 * RichText field has HTML in it. Lets us use a trailing space in value.
 * Adds getCharCount() method to get length based on non-html value
 */
enyo.kind({
	name: "Spaz.RichText",
	kind: enyo.RichText,
	richContent: true, // this needs to always be true – don't publish
	published: {
		maxTextHeight: null,
		selection: null
	},
	getValue: function() {
		return this.getText().replace(/&nbsp;/g, ' ');
	},
	getCharCount: function() {
		return this.getValue().length;
	}
});
