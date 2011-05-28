enyo.depends(
	//vendors
	"vendors/humane.js",
	"vendors/humane-themes/bold-dark.css",
	"vendors/cache.js",
	"vendors/jsOAuth-1.1.js",
	"vendors/jquery.min.js",
	"vendors/spazcore.js", // includes underscore, underscore.string
	
	"vendors/ekl/List/",

	// config
	"source/javascript/config/auth_config.js",
	"source/javascript/config/default_preferences.js",

	// constants we use
	"source/javascript/resources/consts.js",

	// helpers
	"source/javascript/helpers/apputils.js",
	"source/javascript/helpers/appui.js",

	// models
	"source/javascript/models/cache.js",

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
	"source/javascript/ImageViewPopup.js",
	
	//containers
	"source/javascript/NewColumnsContainer.js",
	"source/javascript/AccountsList.js",

	//custom widgets
	"source/javascript/VirtualList.js",
	"source/javascript/Entry.js",
	"source/javascript/Conversation.js",
	"source/javascript/NumberButton.js",
	"source/javascript/RadioButton.js",

	//css
	"source/css/core.css"
);
