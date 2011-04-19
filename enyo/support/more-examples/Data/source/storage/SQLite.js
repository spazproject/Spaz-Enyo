/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "storage.SQLite",
	kind: HeaderView,
	components: [
		{name: "createDBButton", kind: "Button", caption: "Create Database", onclick: "createDB"},
		{name: "createTableButton", kind: "Button", caption: "Create TABLE1", onclick: "createTable"},
		{name: "fillTableButton", kind: "Button", caption: "Insert a Row into TABLE1", onclick: "fillTable"},
		{name: "queryButton", kind: "Button", caption: "Show TABLE1 Contents", onclick: "doQuery"},
		{name: "results", kind: "HtmlContent"},
	],
	createDB: function() {
		try {
			this.db = openDatabase('SampleDB', '', 'Sample Data Store', 65536);
			this.$.results.setContent("Created database SampleDB.");
		}
		catch (e)
		{
			this.$.results.setContent(e);		
		}
	},
	createTable: function() {
		try {
			this.nullHandleCount = 0;
			//create table 1
			var string = 'CREATE TABLE table1 (col1 TEXT NOT NULL DEFAULT "nothing", col2 TEXT NOT NULL DEFAULT "nothing");'
		    this.db.transaction( 
		        enyo.bind(this,(function (transaction) { 
					transaction.executeSql('DROP TABLE IF EXISTS table1;', []); 
		            transaction.executeSql(string, [], enyo.bind(this,this.createTableDataHandler), enyo.bind(this,this.errorHandler)); 
		        }))
		    );
		}
		catch (e)
		{
			this.$.results.setContent(e);
		}
	},
	fillTable: function() {
		/*
		 * Get a random number between 0 and 99
		 */
		var now = new Date();
		var seed = now.getSeconds();
		var random_number = Math.random(seed);
		var range = random_number * 100;
		var rounded_number = Math.round(range);
		/*
		 * Now add a record based on the above.
		 */
		this.$.results.setContent('0');
		this.nullHandleCount = 0;
		value1 = 'valuea' + rounded_number
		value2 = 'valueb' + rounded_number
		var string = 'INSERT INTO table1 (col1, col2) VALUES ("' + value1 + '","' + value2 + '");'	
		this.db.transaction( 
	        enyo.bind(this,(function (transaction) { 
	            transaction.executeSql(string, [], enyo.bind(this,this.createRecordDataHandler), enyo.bind(this,this.errorHandler)); 
	        })) 
	    );
	},
	doQuery: function() {
		// Query table1
		var mytext = 'select * from table1;'
	    this.db.transaction( 
	        enyo.bind(this,(function (transaction) { 
	            transaction.executeSql(mytext, [], enyo.bind(this,this.queryDataHandler), enyo.bind(this,this.errorHandler)); 
	        }))
	    );
	},
	createTableDataHandler: function(transaction, results) 
	{
		this.$.results.setContent("Created TABLE1.");
	},
	createRecordDataHandler: function(transaction, results) 
	{	
		this.$.results.setContent("Inserted 1 record.");
	},
	queryDataHandler: function(transaction, results)
	{
		// Handle the results 
	    var string = ""; 
		try {
			var list = [];
			for (var i = 0; i < results.rows.length; i++) {
				var row = results.rows.item(i);
				for (name in row)
				{
					if (typeof row[name] !== 'function')
					{
						string = string + name + ': ' + row[name] + " | ";
					}
				}
			}
			this.$.results.setContent(string);
		}
		catch (e)
		{
			this.$.results.setContent(e);
		}
	},
	errorHandler: function(transaction, error) 
	{ 
	    this.$.results.setContent('Error was '+error.message+' (Code '+error.code+')'); 
	}
});