enyo.kind({
	name: "Spaz.Sidebar",
	width: "50px",
	kind: "VFlexBox",
	className: "enyo-toolbar-vertical",
	events: {
		onRefreshAll: "",
		onCreateColumn: ""
	},
	components: [
		{kind: "ToolButton", icon: "source/images/icon-compose.png", onclick: "openPopup", popup:"composePopup"},
		{kind: "ToolButton", icon: "source/images/icon-search.png", onclick: "openPopup", popup: "searchPopup"},
		{name: "refreshAll", kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick: "refreshAll"},
		{kind: "Spacer"},
		{kind: "ToolButton", icon: "source/images/icon-new-column.png", onclick: "openPopup", popup: "columnsPopup"},
		{kind: "ToolButton", icon: "source/images/icon-new-account.png", onclick: "openPopup", popup:"accountsPopup"},
		{kind: "ToolButton", icon: "source/images/icon-settings.png", onclick: "openPopup", popup:"settingsPopup"},
		
		{name: "composePopup", kind: "Spaz.ComposePopup", onClose: "closePopup" },
		{name: "searchPopup", kind: "Spaz.SearchPopup", onClose: "closePopup" },
		{name: "columnsPopup", kind: "Spaz.ColumnsPopup", onCreateColumn: "doCreateColumn", onClose: "closePopup" },
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
	},
	refreshAll: function(inSender, inEvent){
		this.$.refreshAll.addClass("spinning");
		this.doRefreshAll();
	},
	refreshAllFinished: function() {
		this.$.refreshAll.removeClass("spinning");
	}
});
