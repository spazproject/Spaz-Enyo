enyo.depends(
	//vendors
	"vendors/jquery.min.js",
	"vendors/underscore-min.js",
	"vendors/underscore.string.min.js",
	"vendors/spazcore-standard.js",

	// config
	"source/javascript/config/auth_config.js",
	"source/javascript/config/default_preferences.js",

	// constants we use
	"source/javascript/resources/consts.js",

	// helpers

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
	"source/javascript/SettingsPopup.js",
	"source/javascript/AccountsPopup.js",
	"source/javascript/EntryClickPopup.js",
	
	//custom widgets
	"source/javascript/AccountsList.js",

	//css
	"source/css/core.css"
);