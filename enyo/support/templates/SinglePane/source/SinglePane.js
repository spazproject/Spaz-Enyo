/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "SinglePane",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", components: [
			{content: "Page Header"}
		]},
		{flex: 1, kind: "Pane", components: [
			{flex: 1, kind: "Scroller", components: [
				//Insert your components here
			]}
		]},
		{kind: "Toolbar", components: [
		]}
	]
});