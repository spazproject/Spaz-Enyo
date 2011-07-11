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
		var components = [];
		_.each(columns, function(column){
			components.push({name: column, flex: 1, kind: "IconButton", style: "font-size:12px; padding-top: 10px;", toggling: true, label: _.capitalize(column), icon: "source/images/icon-"+column+".png", onclick: "newColumn"});
		}, this);
		this.createComponents(components);

		this.render();
	},
	newColumn: function(inSender, inEvent){
		_.each(this.getComponents(), function(component){
			if(component.id !== inSender.id){
				if(component.depressed === true){
					component.setDepressed(false);
				}
			}
		}, this);
		this.doNewColumn(inSender.caption.toLowerCase());
	}
})