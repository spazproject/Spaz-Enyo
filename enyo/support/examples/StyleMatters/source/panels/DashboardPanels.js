/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "panels.DashboardPanels",
	kind: HeaderView,
	components: [
		{kind: "Button", label: "Add Banner", onclick: "addBannerClick"},
		{kind: "Button", label: "Add Dashboard", onclick: "addDashboardClick"}
	],
	addBannerClick: function() {
		enyo.windows.addBannerMessage("Hello!", "{}");
	},
	addDashboardClick: function() {
		enyo.windows.openDashboard("dashboard.html");
	}
});