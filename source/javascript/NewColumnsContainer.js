enyo.kind({
	kind: "HFlexBox",
	name: "Spaz.NewColumnsContainer",
	events: {
		onNewColumn: ""	
	},
	published: {
		selectedAccount: ""	
	},
	created: function(){
		this.inherited(arguments);
	},
	selectedAccountChanged: function(){
		this.buildColumnSelection();	
	},
	buildColumnSelection: function(inSender){
		var account = App.Users.get(this.selectedAccount),
			columns = SPAZ_COLUMN_TYPES[account.type]; //array of available columns

		this.destroyComponents();

		_.each(columns, function(column){
			this.createComponent({name: column, flex: 1, kind: "Button", label: column, onclick: "doNewColumn"});
		}, this);

		this.render();
	}
})