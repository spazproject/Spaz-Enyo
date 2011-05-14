enyo.depends(
	//vendors
	"vendors/humane.js",
	"vendors/humane-themes/bold-dark.css",
	"vendors/jquery.min.js",
	"vendors/spazcore-standard.js", // includes underscore, underscore.string

	// config
	"source/javascript/config/auth_config.js",
	"source/javascript/config/default_preferences.js",

	// constants we use
	"source/javascript/resources/consts.js",

	// helpers
	"source/javascript/helpers/apputils.js",

	// models

	//core
	"source/javascript/Spaz.js",
	
	//views
	"source/javascript/Sidebar.js",
	"source/javascript/Container.js", //container for columns
		"source/javascript/Column.js",
		"source/javascript/SearchColumn.js",
	
	//popouts
	"source/javascript/EntryView.js",
	"source/javascript/UserView.js",
	
	//popups
	"source/javascript/ComposePopup.js",
	"source/javascript/ColumnsPopup.js",
	"source/javascript/SearchPopup.js",
	"source/javascript/SettingsPopup.js",
	"source/javascript/AccountsPopup.js",
	"source/javascript/EntryClickPopup.js",
	
	//containers
	"source/javascript/NewColumnsContainer.js",
	"source/javascript/AccountsList.js",

	//custom widgets
	"source/javascript/VirtualList.js",
	"source/javascript/Entry.js",
	"source/javascript/Conversation.js",

	//css
	"source/css/core.css"
);