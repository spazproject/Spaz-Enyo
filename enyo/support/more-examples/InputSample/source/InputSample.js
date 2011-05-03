/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "InputSample",
	kind: "VFlexBox",
	components: [
		{name: "pane", kind: "Pane", flex: 1, onCreateView: "paneAddView", components: [
			{kind:"VFlexBox", components: [
				{kind: "PageHeader", onclick: "backHandler", components: [
					{kind: "VFlexBox", flex: 1, components: [
						{content: "Canvas Demo"},
						{content: "Dynamic drawing using HTML5 Canvas Elements", style: "font-size: 14px"}
					]},
				]},
				{kind: "Main", flex:1, onItemSelected:"itemSelected"}
			]}
		]}
	],
	itemSelected: function(inSender, inEvent){
		var n = inEvent.viewKind.replace(/\./g, "_");
		this.$.pane.selectViewByName(n);
		var s = this.$[n + "_content"] || this.$[n];
		s.setTitle(inEvent.title)
		s.setDescription(inEvent.description)
	},
	create: function() {
		this.inherited(arguments);
	},
	paneAddView: function(inSender, inName) {
		var name = inName + "_content";
		var kind = inName.replace(/_/g, ".");
		
		// wrap content in scrollers
		return {kind: "Scroller", autoVertical: true, name: inName, components: [{name: name, kind: kind, onBack:'backHandler'}]};
	},
	backHandler: function(inSender, e) {
		if (this.$.pane.getViewIndex() > 0) {
			this.$.pane.back(e);
			var c = this.$.pane.view;
		}
	}
});