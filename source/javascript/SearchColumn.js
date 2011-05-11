enyo.kind({
	name: "Spaz.SearchColumn",
	kind: "Spaz.Column",
	infoChanged: function(){
		this.$.header.setContent(_.capitalize(this.info.type) + ": " + this.info.query);
		this.$.accountName.setContent(App.Users.getLabel(this.info.accounts[0]));

	}
});
