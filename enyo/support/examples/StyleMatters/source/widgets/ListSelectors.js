/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ListSelectors",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{kind: "ListSelector", value: 3, label: "status", items: [
				{caption: "Away", value: 1, icon: "images/status-away.png"},
				{caption: "Available", value: 2, icon: "images/status-available.png"},
				{caption: "Offline", value: 3, icon: "images/status-offline.png"}
			]},
			{kind: "ListSelector", value: "im", items: [
				{caption: "Phone", value: "phone"},
				{caption: "Instant Messenger", value: "im"},
				{caption: "Email", value: "email"},
				{caption: "Conversation", value: "text"}
			]},
			{kind: "ListSelector", value: 3, label: "search", hideItem: true, items: [
				{caption: "Google", value: 1},
				{caption: "Yahoo", value: 2},
				{caption: "Bing", value: 3}
			]},
			{kind: "ListSelector", value: 1, label: "search", hideArrow: true, items: [
				{caption: "Google", value: 1},
				{caption: "Yahoo", value: 2},
				{caption: "Bing", value: 3}
			]},
			{kind: "ListSelector", disabled: true, value: 1, label: "Selector", items: [
				{caption: "Disabled", value: 1},
				{caption: "Enabled", value: 2}
			]},
			{kind: "Item", layoutKind: "HFlexLayout", align: "center", components: [
				{content: "List selector inside a button", flex: 1},
				{kind: "Button", style: "padding: 0 8px; margin: 0;", components: [
					{kind: "ListSelector", value: 1, items: [
						{caption: "Google", value: 1},
						{caption: "Yahoo", value: 2},
						{caption: "Bing", value: 3}
					]}
				]}
			]}
		]}
	]
});