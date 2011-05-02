enyo.kind({
	name: "Spaz.SettingsPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "500px",
	events: {
		onClose: ""
	},
	components: [
		{content: "Settings Popup", style: "font-size: 26px; padding: 6px;"},
		{kind: "Button", flex: 1, caption: "Close/Cancel", onclick: "doClose"},
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.openAtCenter();
	}
});