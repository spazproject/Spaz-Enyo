enyo.kind({
	name: "Spaz.SettingsPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	lazy: false,
	width: "400px",
	height: "600px",
	layoutKind: "VFlexLayout",
	events: {
		onClose: ""
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Settings"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{kind: "Scroller", flex: 1, components: [
			{kind: "Group", caption: "Columns", components: [
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Default Width"},
					{kind: "Spacer"},
					{kind: "ListSelector", items: [
						
					
					]}
				]},

			]},
			{kind: "Group", caption: "Entries", components: [
				{kind: "Item", content: "Text Size"}, //list selector // 10 - 20px
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Embedded Image Preview"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]},

			]},
			{kind: "Group", caption: "Compose", components: [
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Enter Posts"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]},
				{kind: "Item", content: "URL Shortening"}, //list selector
			]},
			{kind: "Group", caption: "Refresh", components: [
				{kind: "Item", content: "Interval"}, //list selector
				//{kind: "Item", content: "Interval for Searches"},
			]},
			{kind: "Group", caption: "Notify", components: [
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "New Entries"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]},
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Mentions"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]},
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Private Messages"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]},
				{kind: "Item", layoutKind: "HFlexLayout", components: [
					{content: "Search Results"},
					{kind: "Spacer"},
					{kind: "CheckBox", onChange: "checkboxClicked"}
				]}
			]},
		]}
		
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.openAtCenter();
	}
});
