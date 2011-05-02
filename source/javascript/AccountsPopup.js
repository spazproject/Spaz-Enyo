enyo.kind({
	name: "Spaz.AccountsPopup",
	kind: enyo.Popup,
	events: {
		onClose: ""
	},
	scrim: true,
	modal: true,
	width: "400px",
	components: [
		{content: "Accounts Popup", style: "font-size: 26px; padding: 6px;"},
		{kind: "Button", flex: 1, caption: "Close/Cancel", onclick: "doClose"},
	],
	showAtCenter: function(){
		this.openAtCenter();

	}
});