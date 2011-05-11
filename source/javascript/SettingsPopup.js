enyo.kind({
	name: "Spaz.SettingsPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	events: {
		onClose: ""
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Settings"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.openAtCenter();
	}
});