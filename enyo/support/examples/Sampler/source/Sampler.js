/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Sampler",
	kind: enyo.VFlexBox,
	components: [
		{kind: "Scroller", flex: 1, components: [
			{kind: "PageHeader", components: [
				{content: "Page Header"}
			]},
			{className: "enyo-row", components: [
				{kind: "ButtonHeader", components: [
					{content: "Header", style: "text-align: center; width: 100%;"}
				]}
			]},
			{kind: "Toolbar", components: [
				{kind: "ToolButton", icon: "images/menu-icon-back.png"},
				{kind: "ToolButton", icon: "images/menu-icon-sync.png"},
				{kind: "ToolButton", icon: "images/menu-icon-info.png"},
				{kind: "ToolButton", icon: "images/menu-icon-forward.png"}
			]},
			{kind: "HFlexBox", className: "enyo-row", align: "center", components: [
				{w: "fill", content: "Turbo Encabulation", domStyles: {padding: "8px"}}, 
				{kind: "ToggleButton"}
			]},
			{kind: "HFlexBox", className: "enyo-row", components: [
				{content: "Splat", domStyles: {display: "inline-block", padding: "10px 8px 10px 8px"}}, 
				{kind: "CheckBox"},
				{content: "Flat", domStyles: {display: "inline-block", padding: "10px 8px 10px 24px"}}, 
				{kind: "CheckBox"},
				{content: "Chat", domStyles: {display: "inline-block", padding: "10px 8px 10px 24px"}}, 
				{kind: "CheckBox"}
			]},
			{kind: "HFlexBox", className: "enyo-row", domStyles: {padding: "4px 0px 4px 4px"}, components: [
				{content: "Modial", domStyles: {padding: "12px 32px 10px 8px"}}, 
				{w: "fill", kind: "RadioGroup", components: [
					{label: 'Rel', value: 0},
					{label: 'Dur', value: 1},
					{label: 'Cap', value: 2}
				]}
			]},
			{className: "enyo-row", components: [
				{kind: "Input", hint: "Name", insetClass: "enyo-flat-shadow"}
			]},
			{className: "enyo-row", components: [
				{kind: "Input", hint: "Name", insetClass: "enyo-flat-shadow", components: [
					{kind: "Group", components: [
						{kind: "Pushable", className: "enyo-roundy", components: [
							{content: "Dmb", height: "40px", width: "48px", domStyles: {"line-height": "40px"}}
						]}
					]}
				]}
			]},
			{className: "enyo-row", components: [
				{kind: "Input", hint: "Job Title", components: [
					{kind: "Group", domStyles: {"background-color": "white", padding: "2px"}, components: [
						{content: '<img src="images/pic.jpg" width="40" height="40" class="enyo-roundy"/>'}
					]}
				]}
			]},
			{kind: "Group", components: [
				{kind: "HFlexBox", domStyles: {padding: "4px 0px 4px 4px"}, components: [
					{content: "Modial", domStyles: {padding: "12px 32px 8px 8px"}}, 
					{w: "fill", kind: "RadioGroup", domStyles: {padding: "0px 4px"}, components: [
						{label: 'Rel', value: 0},
						{label: 'Dur', value: 1},
						{label: 'Cap', value: 2}
					]}	
				]}
			]},
			{kind: "RowGroup", components: [
				{kind: "Input", hint: "Search...", components: [
					{kind: "ListSelector", value: "Google", domStyles: {width: "100px", color: "rgb(31, 117, 191)"}, items: [
						{caption: "Google"},
						{caption: "Yahoo"},
						{caption: "Bing"}
					]}
				]}
			]},
			{kind: "RowGroup", components: [
				{kind: "Input", components: [
					{content: "[Frame]"}
				]}
			]},
			{kind: "Group", components: [
				{kind: "Pushable", className: "enyo-row enyo-roundy", components: [
					{content: "Evacipate memories...", domStyles: {padding: "12px", "font-style": "italic"}}
				]}
			]},
			{kind: "Group", components: [
				{kind: "Pushable", className: "enyo-row enyo-roundy", components: [
					{kind: "HFlexBox", domStyles: {color: "#666", padding: "6px"}, components: [
						{content: "[+]", domStyles: {padding: "8px 8px 8px 12px"}},
						{content: "Add Grievance", domStyles: {padding: "8px"}}
					]}
				]}
			]},
			{kind: "RowGroup", components: [
				{kind: "Input", components: [
					{kind: "Image", domStyles: {width: "32px", height: "32px", background: "url(images/menu-icon-sync.png)"}}
				]},
				{kind: "Input"},
				{kind: "Input", components: [
					{content: "[Btn]"}
				]},
				{kind: "Input", hint: " ", components: [
					{content: "NO GO-AWAY HINT", domStyles: {"text-transform": "uppercase", "text-align": "right", color: "#00ABEF"}}
				]},
				{kind: "Input"}
			]},
			{kind: "DividerDrawer", caption: "Divider", components: [
				{kind: "RowGroup", caption: "Default Web Search Engine", components: [
					{kind: "ListSelector", value: "Google", items: [
						{caption: "Google"},
						{caption: "Wikipedia"},
						{caption: "Bing"}
					]}
				]},
				{kind: "HFlexBox", components: [
					{className: "enyo-picker-label", content: "integer"},
					{kind: "Picker", value: 0, items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
				]},
				{kind: "HFlexBox", components: [
					{kind: "HFlexBox", components: [
						{className: "enyo-picker-label", content: "first"},
						{kind: "Picker", value: "1", items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]},
					]},
					{kind: "HFlexBox", components: [
						{className: "enyo-picker-label", content: "city"},
						{kind: "Picker", value: "San Francisco", textAlign: "left", items: ["San Francisco", "Sunnyvale", "Oakland", "Burlingame"]},
					]},
				]},
			]},
			{kind: "RowGroup", caption: "New Account", components: [
				{kind: "Input", hint: "Username"},
				{kind: "PasswordInput", hint: "Password"}
			]},
			{kind: "Group", components: [
				{kind: "Button", caption: "Button"},
				{kind: "ActivityButton", active: true, caption: "Activity Button"}
			]},
			{height: "60px", domStyles: {"background-color": "#DDDDDD"}}
		]},
		{kind: "Dialog", components: [
			{kind: "RowGroup", components: [
				{kind: "Input"},
				{kind: "Input", hint: "Name..."}
			]},
			{kind: "Button", caption: "Cancel", onclick: "toggleOpenDialog"}
		]},
		{kind: "Toolbar", components: [
			{caption: "Add", onclick: "toggleOpenDialog"},
			{caption: "Remove"},
			{flex: 1},
			{caption: "Cancel"}
		]}
	],
	toggleOpenDialog: function() {
		this.$.dialog.toggleOpen();
	}
});