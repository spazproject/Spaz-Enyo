enyo.kind({
	name: "Spaz.ComposePopup",
	kind: enyo.Popup,
	events: {
		onClose: ""
	},
	scrim: true,
	modal: true,
	width: "400px",
	components: [
		{content: "Compose Popup", style: "font-size: 26px; padding: 6px;"},
		{kind: "Button", flex: 1, caption: "Close/Cancel", onclick: "doClose"},
	]
});