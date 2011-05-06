enyo.kind({
	name: "Spaz.AvatarList",
	kind: "HFlexBox",
	published: {
		filterValue: ""	
	},
	events: {
		onShowAccountColumns: ""	
	},
	create: function(){
		this.inherited(arguments);
	},
	accounts: [
		{name: "spaztest", type: "twitter", avatar: "http://a3.twimg.com/sticky/default_profile_images/default_profile_3_bigger.png"},
		{name: "Tibfib", type: "identi.ca", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png"}
	],
	filterValueChanged: function(){
		this.buildList();	
	},
	buildList: function(){
		this.destroyComponents();

		var objs = [];
		_.each(this.accounts, function(account){
			if(this.filterValue === "all" || this.filterValue === account.type ){
				//custom toggle buttons with images being the profile pic
				objs.push({name: account.name, kind: "Spaz.AvatarButton", avatar: account.avatar, toggling: true, onclick: "focusAccount"});
			}	
		}, this);
		this.createComponents(objs);
		this.focusAccount(objs[0]);
		this.render();

	},
	focusAccount: function(inSender, inEvent){
		_.each(this.accounts, function(account){
			if(this.filterValue === "all" || this.filterValue === account.type ){
				this.$[account.name].focusOne(inSender.avatar);	
				if(account.avatar === inSender.avatar){//TODO: change to unique id or something
					this.doShowAccountColumns(account);
				}
			}	
		}, this);

	}
});