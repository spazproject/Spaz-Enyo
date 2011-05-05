enyo.kind({
	name: "Spaz.Sidebar",
	width: "50px",
	kind: "VFlexBox",
	className: "enyo-toolbar-vertical",
	components: [
		{kind: "ToolButton", icon: "source/images/icon-compose.png", onclick: "openPopup", popup:"composePopup"},
		{kind: "ToolButton", icon: "source/images/icon-new-column.png", onclick: "openPopup", popup: "columnsPopup"},
		{kind: "ToolButton", icon: "source/images/icon-search.png"},
		{kind: "Spacer"},
		{kind: "ToolButton", icon: "source/images/icon-new-account.png", onclick: "openPopup", popup:"accountsPopup"},
		{kind: "ToolButton", icon: "source/images/icon-settings.png", onclick: "openPopup", popup:"settingsPopup"},
		
		{name: "composePopup", kind: "Spaz.ComposePopup", onClose: "closePopup" },
		{name: "columnsPopup", kind: "Spaz.ColumnsPopup", onClose: "closePopup" },
		{name: "settingsPopup", kind: "Spaz.SettingsPopup", onClose: "closePopup" },
		{name: "accountsPopup", kind: "Spaz.AccountsPopup", onClose: "closePopup" }
	],
	openPopup: function(inSender) {
		// inSender is the component that triggers this; .popup is the property in the def above
		var popup = this.$[inSender.popup]; // find the component with the passed name
		if (popup) {
			popup.showAtCenter(); //custom function so the popup can do stuff on open
		}	
	},
	closePopup: function(inSender) {
		inSender.close();
	}
});