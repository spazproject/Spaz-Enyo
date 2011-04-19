/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "containers.DrawerDrawer",
	kind: HeaderView,
	components: [
		{
			name: "worldDrawer",
			caption: "World",
			captionClassName: "enyo-item",
			kind: "enyo.Drawer",
			open: false,
			components: [
				{
					name: "northAmericaDrawer",
					caption: "North America",
					captionClassName: "enyo-item",
					kind: "enyo.Drawer",
					open: false,
					components: [
						{
							name: "usaDrawer",
							caption: "USA",
							defaultKind: "Item",
							captionClassName: "enyo-item",
							kind: "enyo.Drawer",
							open: false,
							components: [
								{content: "Seattle"},
								{content: "San Francisco"}
							]
						},
						{
							name: "canadaDrawer",
							caption: "Canada",
							defaultKind: "Item",
							captionClassName: "enyo-item",
							kind: "enyo.Drawer",
							open: false,
							components: [
								{content: "Vancouver"},
								{content: "Edmonton"}
							]
						}
					]
				}
			]
		}
	]
});