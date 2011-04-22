enyo.kind({
	name: "Spaz.Sidebar",
	width: "50px",
	kind: "VFlexBox",
	className: "enyo-toolbar-vertical",
	components: [
		{kind: "ToolButton", icon: "source/images/icon-compose.png"},
		{kind: "ToolButton", icon: "source/images/icon-new-column.png"},
		{kind: "ToolButton", icon: "source/images/icon-search.png"},
		{kind: "Spacer"},
		{kind: "ToolButton", icon: "source/images/icon-settings.png"}
	]
});