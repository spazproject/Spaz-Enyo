enyo.kind({
	name: "Spaz.EmoticonPopup",
	kind: "Spaz.Popup",
	height: "75%",
	events: {
		onEmoticonSelected: ""
	},
	components: [
		{
			name: "list",
			kind: "enyo.VirtualList",
			height: "100%",
			flex: 1,
			onSetupRow: "setupRow",
			onclick: "rowClick",
			components: [
				{
					kind: "enyo.Item",
					layoutKind: "enyo.HFlexLayout",
					components: [
						{
							name: "code",
							flex: 2
						},
						{
							name: "emoticon",
							flex: 1,
							allowHtml: true
						}
					]
				}
			]
		}
	],
	
	openAtTopCenter: function() {
		if(!this.mappings) {
			this.mappings = [];
			for (var mapping in EmoticonSets.SAE.mappings) {
				this.mappings.push (mapping);
			}
		}
		this.inherited(arguments);
	},
	
	setupRow: function(inSender, inIndex) {
		if(this.mappings[inIndex]) {
			this.$.code.setContent(this.mappings[inIndex]);
			this.$.emoticon.setContent(window.SAE.apply(this.mappings[inIndex]));
			return true;
		}
	},
	
	rowClick: function(inSender, inEvent) {
		this.close();
		this.doEmoticonSelected(this.mappings[inEvent.rowIndex]);
	}
});
