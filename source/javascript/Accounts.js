enyo.kind({
	name: "Spaz.Accounts",
	width: "200px",
	kind: "SlidingView",
	events: {
		onToggleSlider: ""
	},
	components: [
		{kind: "Toolbar", content: "Spaz", style: "color: white"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "VirtualRepeater", onGetItem: "getItem", components: [
				{kind: "Item", tapHighlight: true, layoutKind: "HFlexLayout", components: [
					{name: "caption", flex: 1, height: "30px"},
				]}
			]}
		]},
		//{kind: "enyo.HFlexBox", style: "padding-left: 3px", components: [
		//	{kind: "BasicInput", value: "", width: "190px", hint: "Search", components: [
		//		//{kind: "IconButton", label: "I am a label", icon: "images/foo.png"}
		//	]},//onchange: "inputChange", onfocus: "inputFocus"},
		//]},
		{kind: "Toolbar", components: [
			{name: "toggleSlider", kind: "ToolButton", icon: "source/images/icon-shrink.png", onclick: "toggleSlider"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-search.png"},
			{kind: "ToolButton", icon: "source/images/icon-compose.png"}
			//{kind: "ToolButton", content: "Compose"}
		]}
	],
	accounts: [
		{name: "Home", type: "Twitter"},
		{name: "Replies", type: "Twitter"},
		{name: "Direct Messages", type: "Twitter"},
		{name: "Sent", type: "Twitter"},

		{name: "@Spaz", type: "Twitter"},
		{name: "@Tibfib", type: "Twitter"}
	],
	getItem: function(inSender, inIndex) {
		if (this.accounts[inIndex]) {
			this.$.caption.setContent(this.accounts[inIndex].name);
			return true;
		}
	},
	"toggleSlider": function(inSender, inEvent){
		if(_.includes(this.$.toggleSlider.icon, "expand")){
			this.$.toggleSlider.setIcon("source/images/icon-shrink.png");
		} else {
			this.$.toggleSlider.setIcon("source/images/icon-expand.png");	
		}
		this.doToggleSlider();
	}
});