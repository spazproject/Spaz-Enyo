/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "Header", content: "Enyo Onyx Theme"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "Example", caption: "Activity Button", components: [
				{kind: "ActivityButton", caption: "Inactive"},
				{kind: "ActivityButton", active: true, caption: "Active"}
			]},
			{kind: "Example", caption: "Input and RichText", components: [
				{kind: "Input", value: "Hello World", components: [
					{content: "Foo"}
				]},
				{kind: "Input", hint: "Foo bar bat", className: "enyo-middle"},
				{kind: "RichText", hint: "RichText"},
				{kind: "RichText", value: "<b>RichText</b>"},
				{kind: "InputBox", layoutKind: "HFlexLayout", components: [
					{content: "Left", style: "padding: 0 10px"},
					{kind: "Input", styled: false, flex: 1},
					{content: "Right", style: "padding: 0 10px"},
				]},
				{kind: "RoundedInput", value: "Rounded Input", components: [
					{content: "Foo"},
				]},
				{kind: "SearchInput", value: "Search Input"},
				{kind: "ToolInput", value: "It's a tool"},
			]},
			{kind: "Example", caption: "Slider & ProgressSlider", components: [
				{kind: "Slider"},
				{kind: "ProgressSlider", onChange:"simulateSliderProgress"}
			]},
			{kind:"Example", caption:"Group and RowGroup", components: [
				{kind:"RowGroup", components: [
					{kind:"Input", value:"Input"},
					{kind:"PasswordInput", value:"Input"},
					{kind:"Input", value: "Input"},
					{kind: "RichText", value: "<b>RichText</b>"},
				]},
				{kind:"RowGroup", caption:"Labeled RowGroup", components: [
					{kind:"Input", value:"Input"},
					{kind:"Input", value:"Input"},
					{kind:"Input"},
					{kind:"Input", value:"Input"}
				]},
				{kind:"Group", components: [
					{kind:"Input", value:"Input"}
				]},
				{kind:"Group", caption:"Labeled Group", components: [
					{kind:"Input", value:"Input"}
				]}
			]},
			{kind: "Example", caption: "Picker (needs to fix popup position)", components: [
				{label: "integer", kind: "IntegerPicker"},
				{kind: "TimePicker"},
				{kind: "DatePicker"}
			]},
			{kind: "Example", caption: "Checkbox", components: [
				{kind: "CheckBox"},
				{kind: "CheckBox", checked: true},
				{kind: "CheckBox", disabled: true},
				{kind: "CheckBox", checked: true, disabled: true}
			]},
			{kind: "Example", caption: "ToggleButton", components: [
				{kind: "ToggleButton", style:"margin-right:30px;"},
				{kind: "ToggleButton", onLabel:"Enableamente&nbsp", offLabel:"Disableamente", style:"margin-right:30px;"},
				{kind: "ToggleButton", disabled:true, style:"margin-right:30px;"},
				{kind: "ToggleButton", disabled:true, state:true, style:"margin-right:30px;"}
			]},
			{kind: "Example", caption: "Button", components: [
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", caption: "Button!"},
					{kind: "Button", caption: "Disabled button!", disabled: true},
					{kind: "Button", caption: "Toggling button!", toggling: true},
					{kind: "Button", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", className: "enyo-button-light", caption: "Button!"},
					{kind: "Button", className: "enyo-button-light", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-light", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-light", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", className: "enyo-button-dark", caption: "Button!"},
					{kind: "Button", className: "enyo-button-dark", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-dark", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-dark", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", className: "enyo-button-affirmative", caption: "Button!"},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", className: "enyo-button-negative", caption: "Button!"},
					{kind: "Button", className: "enyo-button-negative", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-negative", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-negative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, components: [
					{kind: "Button", className: "enyo-button-blue", caption: "Button!"},
					{kind: "Button", className: "enyo-button-blue", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-blue", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-blue", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", caption: "Button!"},
					{kind: "Button", caption: "Disabled button!", disabled: true},
					{kind: "Button", caption: "Toggling button!", toggling: true},
					{kind: "Button", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-light", caption: "Button!"},
					{kind: "Button", className: "enyo-button-light", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-light", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-light", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-dark", caption: "Button!"},
					{kind: "Button", className: "enyo-button-dark", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-dark", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-dark", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-affirmative", caption: "Button!"},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-affirmative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-negative", caption: "Button!"},
					{kind: "Button", className: "enyo-button-negative", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-negative", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-negative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-blue", caption: "Button!"},
					{kind: "Button", className: "enyo-button-blue", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-blue", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-blue", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #333", components: [
					{kind: "Button", className: "enyo-button-natural-width enyo-button-dark", caption: "Button!"},
					{kind: "Button", className: "enyo-button-natural-width enyo-button-dark", caption: "Disabled button!", disabled: true},
					{kind: "Button", className: "enyo-button-natural-width enyo-button-dark", caption: "Toggling button!", toggling: true},
					{kind: "Button", className: "enyo-button-natural-width enyo-button-dark", caption: "Looooooooooooooooooong button"}
				]}
			]},
			{kind: "Example", caption: "Notification Buttons", components: [
				{kind: enyo.HFlexBox, style: "background-color: #000", components: [
					{kind: "NotificationButton", caption: "Button!"},
					{kind: "NotificationButton", caption: "Disabled button!", disabled: true},
					{kind: "NotificationButton", caption: "Toggling button!", toggling: true},
					{kind: "NotificationButton", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #000", components: [
					{kind: "NotificationButton", className: "enyo-notification-button-affirmative", caption: "Button!"},
					{kind: "NotificationButton", className: "enyo-notification-button-affirmative", caption: "Disabled button!", disabled: true},
					{kind: "NotificationButton", className: "enyo-notification-button-affirmative", caption: "Toggling button!", toggling: true},
					{kind: "NotificationButton", className: "enyo-notification-button-affirmative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #000", components: [
					{kind: "NotificationButton", className: "enyo-notification-button-negative", caption: "Button!"},
					{kind: "NotificationButton", className: "enyo-notification-button-negative", caption: "Disabled button!", disabled: true},
					{kind: "NotificationButton", className: "enyo-notification-button-negative", caption: "Toggling button!", toggling: true},
					{kind: "NotificationButton", className: "enyo-notification-button-negative", caption: "Looooooooooooooooooong button"}
				]},
				{kind: enyo.HFlexBox, style: "background-color: #000", components: [
					{kind: "NotificationButton", className: "enyo-notification-button-alternate", caption: "Button!"},
					{kind: "NotificationButton", className: "enyo-notification-button-alternate", caption: "Disabled button!", disabled: true},
					{kind: "NotificationButton", className: "enyo-notification-button-alternate", caption: "Toggling button!", toggling: true},
					{kind: "NotificationButton", className: "enyo-notification-button-alternate", caption: "Looooooooooooooooooong button"}
				]}
			]},
			{kind: "Example", caption: "Radio Buttons", components: [
				{kind: enyo.VFlexBox, components: [
					{kind: "RadioGroup", components: [
						{label: "Enabled"},
						{label: "bar"},
						{label: "Disabled", disabled: true},
						{icon: "images/yahoo-32x32.png"}
					]},
					{kind: "RadioGroup", components: [
						{label: "foo", className: "enyo-radiobutton-dark"},
						{label: "bar", className: "enyo-radiobutton-dark"},
						{label: "Disabled", className: "enyo-radiobutton-dark", disabled: true},
						{label: "baz", className: "enyo-radiobutton-dark"}
					]},
					{kind: "RadioGroup", components: [
						{label: "Single Selected", className: "enyo-radiobutton"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Single", className: "enyo-radiobutton"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Disabled", className: "enyo-radiobutton", disabled: true},
					]},
					{kind: "RadioGroup", components: [
						{label: "Single Selected", className: "enyo-radiobutton-dark"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Single", className: "enyo-radiobutton-dark"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Disabled", className: "enyo-radiobutton-dark", disabled: true},
					]}
				]},
				{kind: enyo.VFlexBox, style: "background-color: #333", components: [
					{kind: "RadioGroup", components: [
						{label: "foo"},
						{label: "bar"},
						{label: "Disabled", disabled: true},
						{label: "baz"}
					]},
					{kind: "RadioGroup", components: [
						{label: "foo", className: "enyo-radiobutton-dark"},
						{label: "bar", className: "enyo-radiobutton-dark"},
						{label: "Disabled", className: "enyo-radiobutton-dark", disabled: true},
						{label: "baz", className: "enyo-radiobutton-dark"}
					]},
					{kind: "RadioGroup", components: [
						{label: "Single Selected", className: "enyo-radiobutton"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Single", className: "enyo-radiobutton"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Disabled", className: "enyo-radiobutton", disabled: true},
					]},
					{kind: "RadioGroup", components: [
						{label: "Single Selected", className: "enyo-radiobutton-dark"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Single", className: "enyo-radiobutton-dark"},
					]},
					{kind: "RadioGroup", value: 1, components: [
						{label: "Single", className: "enyo-radiobutton-dark", disabled: true},
					]}
				]}
			]},
			{kind: "Example", caption: "Tabs", components: [
				{kind: "TabGroup", components: [
					{label: "Enabled"},
					{label: "bar"},
					{label: "Disabled", disabled: true},
					{label: "baz"}
				]},
				{kind: "TabGroup", components: [
					{label: "Single Selected"},
				]},
				{kind: "TabGroup", value: 1, components: [
					{label: "Single"},
				]},
				{kind: "TabGroup", value: 1, components: [
					{label: "Disabled", disabled: true},
				]},
			]},
			{kind: "Example", caption: "Popup and AppMenu", layoutKind: "HFlexLayout", components: [
				{kind: "Button", caption: "Popup", onclick: "showPopup"},
				{kind: "Popup", scrim: true, components: [
					{content: "This is a popup!"},
					{kind: "Button", caption: "Close", popupHandler: true}
				]},
				{kind: "Button", caption: "Menu", onclick: "showMenu"},
				{kind: "Menu", components: [
					{content: "Uno"},
					{content: "Duex"},
					{content: "San"},
				]},
				{kind: "Button", caption: "AppMenu", onclick: "openAppMenuHandler"},
				{kind: "AppMenu", components: [
					{caption: "Foo"},
					{kind: "EditMenu"},
					{caption: "Foo"},
					{caption: "Bar"},
					{caption: "Bat"}
				]},
				{kind: "ListSelector", value: "Foo", items: [
					{caption: "Foo"},
					{caption: "Bar Happy pie people"},
					{caption: "Bat"}
				]}
			]},
			{kind: "Example", caption: "ProgresBar", components: [
				{kind: "ProgressBar", onclick: "simulateProgress"},
			]},
			{kind: "Example", caption: "ProgresBarItem", components: [
				{kind: "ProgressBarItem", onclick: "simulateProgress", components: [
					{content: "Progressing short... ", style:"margin:-12px 0;height:24px"}
				]},
				{kind: "ProgressBarItem", onclick: "simulateProgress", style:"height:48px; margin-top: 2px;", components: [
					{content: "Progressing tall... "}
				]},	
			]},
			{kind: "Example", caption: "ProgressButton", components: [
				{kind: "ProgressButton", onCancel:"cancelProgress", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Default progress..."}]},
				{kind: "ProgressButton", onCancel:"cancelProgress", style: "margin:2px 0;", onclick: "simulateProgress", 
						cancelable:false, components: [{content: "Uncancelable progress..."}]},
				{kind: "ProgressButton", className: "affirmative", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Affirmative progress..."}]},
				{kind: "ProgressButton", className: "negative", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Negative progress..."}]},
				{kind: "ProgressButton", className: "blue", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Blue progress..."}]},
				{kind: "ProgressButton", className: "light", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Light progress..."}]},
				{kind: "ProgressButton", className: "dark", style: "margin:2px 0;", onclick: "simulateProgress", 
						onCancel:"cancelProgress", components: [{content: "Dark progress..."}]},				
			]},
			{kind: "Example", caption: "Divider and Drawer", components: [
				{kind: "Divider", caption: "Address"},
				{kind: "Divider", caption: "Email"},
				{kind: "DividerDrawer", caption: "EXAMPLE 1", open: false, components: [
					{content: "Something...", style: "padding: 14px;"}
				]},
				{kind: "DividerDrawer", caption: "EXAMPLE 2", open: false, components: [
					{content: "More Stuffs...", style: "padding: 14px;"}
				]},
				{kind: "DividerDrawer", caption: "EXAMPLE 3", icon: "images/yahoo-32x32.png", open: false, components: [
					{content: "Yahoo...", style: "padding: 14px;"}
				]}
			]},
			{kind: "Example", caption: "List (Item and SwipeableItem)", components: [
				{name: "list", kind: "VirtualList", style: "height: 200px; background: lightgrey;", onSetupRow: "listSetupRow", components: [
					{name: "listItem", kind: "SwipeableItem", tapHighlight: true, onclick: "listItemClick", components: [
						{name: "listItemContent"}
					]}
				]}
			]},
			{kind: "Example", caption: "ListSelector", components: [
				{kind: "ListSelector", value: 3, label: "status", items: [
					{caption: "Away", value: 1},
					{caption: "Available", value: 2},
					{caption: "Offline", value: 3}
				]},
			]},
			{kind: "Example", caption: "Header", components: [
				{kind: "Header", content: "Header", style: "margin: 8px;"},
				{kind: "Header", content: "Header<br><br>Tall", style: "margin: 8px;"},
				{kind: "Header", content: "Header - Colored", style: "background: #67a; margin: 8px;"}
			]},
			{kind: "Example", caption: "Toolbar", components: [
				{kind: "Toolbar", style: "margin: 8px;", components: [
					{kind: "GrabButton"},
					{kind: "Control", content: "Toolbar"}
				]},
				{kind: "Toolbar", content: "Toolbar<br><br>Tall", style: "margin: 8px;"},
				{kind: "Toolbar", style: "background: #67a; margin: 8px;", components: [
					{kind: "GrabButton"},
					{kind: "Control", content: "Toolbar - Colored"}
				]}
			]},
			{kind: "Example", caption: "ToolButton", components: [
				{kind: "Toolbar", components: [
					{caption: "Foo"},
					{kind: "Button", caption: "Foo", className: "enyo-button-dark"},
					{icon: "images/menu-icon-delete.png"},
					{icon: "images/menu-icon-forward-email.png"},
					{icon: "images/menu-icon-reply.png", toggling: true},
					{icon: "images/menu-icon-send.png"},
					{kind: "ToolInput", value: "It's a tool"},
					{caption: "Foo"}
				]}
			]},
			// FIXME: scroll height seems broken atm
			{height: "10px"}
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"}
		]}
	],
	openAppMenuHandler: function() {
		this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
		this.$.appMenu.close();
	},
	showPopup: function(inSender) {
		this.$.popup.openAtCenter();
	},
	showMenu: function(inSender) {
		this.$.menu.openAroundControl(inSender);
	},
	simulateProgress: function(inSender) {
		inSender.setPosition(Math.random()*100);
	},
	simulateSliderProgress: function(inSender) {
		var val = Math.random()*100;
		inSender.setBarPosition(val);
		inSender.setAltBarPosition(val + (Math.random()*(100-val)));
	},
	listSetupRow: function(inSender, inIndex) {
		if (inIndex < 5 && inIndex > -1) {
			this.$.listItemContent.setContent("item" + inIndex);
			this.$.listItem.addRemoveClass("enyo-item-selected", inSender.isSelected(inIndex));
			return true;
		}
	},
	listItemClick: function(inSender, inEvent, inRowIndex) {
		this.$.list.select(inRowIndex);
	},
	cancelProgress: function(inSender) {
		inSender.setPosition(0);
	}
});

