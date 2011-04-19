/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Layout",
	kind: "HFlexBox",
	components: [
		{content: "Uber Left", style: "border: 4px solid lightgreen; padding: 4px;"},
		{flex: 1, kind: "VFlexBox", components: [
			{content: "The pane below expands to fit its content.", className: "text"},
			{kind: "Pane", layoutKind: "", transitionKind: "enyo.transitions.Simple", onclick: "paneClick", components: [
				{kind: "HtmlContent", srcId: "expando0", className: "expando"},
				{kind: "HtmlContent", srcId: "expando1", className: "expando"}
			]},
			//
			{content: "The pane below fits to the remaining space in the page.", className: "text"},
			{flex: 1, kind: "Pane", onclick: "paneClick", transitionKind: "enyo.transitions.Simple", components: [
				// view 1
				{kind: "Scroller", className: "gray", components: [
					{kind: "HtmlContent", srcId: "view1", className: "view1 hash"}
				]},
				// view 2
				{kind: "Scroller", className: "gray", components: [
					{kind: "HtmlContent", srcId: "view2", className: "view2 hash"}
				]},
				// view 3
				{kind: "VFlexBox", className: "view3", components: [
					{content: "Header", className: "view3-header"},
					{kind: "HFlexBox", flex: 1, components: [ 
						{flex: 1, content: "Left", className: "view3-left"},
						{flex: 3, kind: "Scroller", className: "gray", components: [
							{kind: "HtmlContent", srcId: "view3", className: "view3-content hash"}
						]},
						{flex: 1, content: "Right", className: "view3-left"},
					]},
					{content: "Footer", className: "view3-header"}
				]},
				// view 4
				{className: "view4", kind: "HFlexBox", components: [
					{flex: 1, content: "Left", className: "view3-left"},
					{flex: 4, kind: "Scroller", className: "gray", components: [
						{kind: "HtmlContent", srcId: "view4", className: "view4-content hash"}
					]},
					{flex: 1, content: "Right", className: "view3-left"}
				]},
				// view 5
				{className: "view3", noScroller: true, kind: "VFlexBox", components: [
					{content: "Header", className: "view3-header"},
					{kind: "HFlexBox", flex: 1, components: [ 
						{flex: 1, kind: "Pane", className: "view3-left", onclick: "paneClick", components: [
							{kind: "Scroller", components: [
								{content: "Left pane view 1 of 3 (small)", className: "text hash"},
							]},
							{kind: "Scroller", components: [
								{content: "Left pane view 2 of 3 (tall)", className: "text hash", style: "height: 2048px"},
							]},
							{kind: "Scroller", components: [
								{content: "Left pane view 3 of 3 (wide)", className: "text hash", style: "width: 2048px"}
							]}
						]},
						{flex: 3, kind: "Scroller", className: "gray", components: [
							{kind: "HtmlContent", srcId: "view3", className: "view3-content min hash"}
						]},
						{flex: 1, content: "Right", className: "view3-left"},
					]},
					{content: "Footer", className: "view3-header"}
				]},
				// view 6
				{className: "view3", kind: "VFlexBox", components: [
					{kind: "Scroller", flex: 1, components: [
						{content: "Scroller Item 1"},
						{content: "Scroller Item 2"},
						{content: "Scroller Item 3"}
					]}
				]},
				// view 7
				{className: "view3", noScroller: true, kind: "VFlexBox", components: [
					{kind: "Scroller", flex: 1, className: "gray", components: [
						{style: "background-color:#eeeeee;", components: [
							{content: "Scroller Item 1"},
							{content: "Scroller Item 2"},
							{content: "Scroller Item 3"}
						]}
					]}
				]}
			]},
			{content: "Some footer content", className: "text"}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	paneClick: function(inSender) {
		inSender.next();
		return true;
	}
});