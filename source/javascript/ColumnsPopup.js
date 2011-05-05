enyo.kind({
	name: "Spaz.ColumnsPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "500px",
	events: {
		onClose: ""
	},
	components: [
		{kind: "HFlexBox", components: [
			{name: "service", onChange: "buildAccounts", kind: "ListSelector", value: "all", items: [
			    {caption: "All", value: "all"},
			    {caption: "Twitter", value: "twitter"},
			    {caption: "Identi.ca", value: "identi.ca"},
			    {caption: "Status.net", value: "status.net"},
			]},
			{name: "accounts", kind: "HFlexBox", components: [

			]},

		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		this.buildAccounts();
		this.openAtCenter();
	},
	accounts: [
		{name: "spaztest", type: "twitter", avatar: "http://a3.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png"},
		{name: "Tibfib", type: "identi.ca", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png"}
	],
	buildAccounts: function(){
		this.$.accounts.destroyComponents();

		var objs = [], filterValue = this.$.service.getValue();
		_.each(this.accounts, function(account){
			if(filterValue === "all" || filterValue === account.type ){
				//custom toggle buttons with images being the profile pic
				objs.push({name: account.name, kind: "Spaz.AvatarButton", avatar: account.avatar, toggling: true, onShowAccountColumns: "showAccountColumns"});
			}	
		});
		this.$.accounts.createComponents(objs);
		this.$.accounts.render();
	},
	showAccountColumns: function(inSender, inEvent){
		console.log("fired");

	}
});