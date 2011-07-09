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
		var columns;
		if(AppUtils.isService(this.selectedAccount)){
			columns = SPAZ_COLUMN_TYPES_ALL[this.selectedAccount]
		} else {
			columns = SPAZ_COLUMN_TYPES[App.Users.get(this.selectedAccount).type]; //array of available columns
		}

		this.destroyComponents();

		_.each(columns, function(column){
			this.createComponent({name: column, flex: 1, kind: "IconButton", style: "font-size:12px; padding-top: 10px;", toggling: true, label: _.capitalize(column), icon: "source/images/icon-"+column+".png", onclick: "newColumn"});
		}, this);

		this.render();
	},
	newColumn: function(inSender, inEvent){
		this.doNewColumn(inSender.caption.toLowerCase());
	}
})