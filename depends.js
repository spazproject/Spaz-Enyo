enyo.depends(
	//vendors
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
	
	//popouts
	"source/javascript/EntryView.js",
	
	//popups
	"source/javascript/ComposePopup.js",
	"source/javascript/ColumnsPopup.js",
	"source/javascript/SettingsPopup.js",
	"source/javascript/AccountsPopup.js",
	"source/javascript/EntryClickPopup.js",
	
	//custom widgets
	"source/javascript/VirtualList.js",
	"source/javascript/AccountsList.js",
	"source/javascript/AvatarList.js",
	"source/javascript/AvatarButton.js",

	//css
	"source/css/core.css"
);