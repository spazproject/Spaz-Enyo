enyo.kind({
	name: "Spaz.Sidebar",
	width: "50px",
	kind: "VFlexBox",
	className: "enyo-toolbar-vertical",
	components: [
		{name: "composeButton", kind: "ToolButton", icon: "source/images/icon-compose.png", onclick: "compose"},
		{kind: "ToolButton", icon: "source/images/icon-new-column.png"},
		{kind: "ToolButton", icon: "source/images/icon-search.png"},
		{kind: "Spacer"},
		{kind: "ToolButton", icon: "source/images/icon-settings.png"},
		
		{name: "composeDialog", kind: "Spaz.ComposeDialog"}
	],
	"compose": function(){
		this.$.composeDialog.showAtCenter();
	}
});