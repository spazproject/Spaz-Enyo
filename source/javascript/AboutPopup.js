enyo.kind({
	name: "Spaz.AboutPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	events: {
		onClose: "",
	},
	components: [
		{kind: "enyo.VFlexBox", width:"400px", height:"400px", components: [
			{kind: "PageHeader", className: "enyo-header-dark", name:"header", height:"50px", style:"border-radius:10px", components:[
				{kind: "HtmlContent", content:enyo.fetchAppInfo().title + ' v' + enyo.fetchAppInfo().version, style: "padding-left: 10px", flex:1},
				{kind: "enyo.ToolButton", icon: "source/images/icon-close.png", onclick: "doClose", align:"right"},
				// {kind: "enyo.Image", style: "position: absolute; left:-100px; top:-100px; opacity: 0.2; width: 90%; z-index: -100", src: "spaz-icon-flat-512.png"},
			]},
			
			{name: "contentScroller", flex:1, kind: "enyo.BasicScroller", onclick: "entryClick", components: [
				{kind: "HtmlContent", name:"aboutContent", style: "font-size: 14px", srcId: "aboutContent"},
				{kind: "HtmlContent", name:"licenseContent", style: "font-size: 14px", srcId: "licenseContent"}
			]},
			
			{kind: "Toolbar", style: "border-radius:10px", height:"50px", components: [
				{caption: $L("Get Help"), style:"color:#000;", onclick:"openHelp"},
				{caption: $L("Volunteer Now"), style:"color:#000;", onclick:"openVolunteerInfo"},
				{caption: $L("View License"), style:"color:#000;",  onclick:"toggleLicense", toggling:true}
			]}
		]},

	],
	
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		// this.$.scroller.setScrollTop(0);
		this.openAtCenter();
		this.showLicense(false);
	},
	
	entryClick: function(inSender, inEvent) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			var twitter_accounts = App.Users.getByType(SPAZCORE_SERVICE_TWITTER)
			if (twitter_accounts && twitter_accounts[0] && twitter_accounts[0].id) {
				AppUI.viewUser(username, SPAZCORE_SERVICE_TWITTER, twitter_accounts[0].id);
			} else {
				AppUI.viewUser(username, SPAZCORE_SERVICE_TWITTER);
			}
			this.doClose();
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText);
			this.doClose();
		}
	},
	
	openHelp: function() {
		sch.openInBrowser('http://help.getspaz.com');
	},
	
	openVolunteerInfo: function() {
		sch.openInBrowser('http://getspaz.com/helpus');
	},
	
	toggleLicense: function(inSender) {
		if (this.$.licenseContent.showing) {
			this.showLicense(false);
		} else {
			this.showLicense(true);
		}
	},
	
	showLicense: function(state) {
		if (state === false) {
			this.$.licenseContent.hide();
			this.$.aboutContent.show();
		} else {
			this.$.licenseContent.show();
			this.$.aboutContent.hide();
		}
	}
});
