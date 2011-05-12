/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrinterSelector",
	kind: enyo.VFlexBox,
	searchTimeout: 10,		// how many seconds to timeout 
	published: {
		selectedPrinter: undefined
	},
	events: {
		onSelect: "",
		onChangeCount: "",
		onAddPrinter: ""
	},
	components: [
		{kind: "Pane", flex: 1, transitionKind: "enyo.transitions.Simple", onSelectView: "viewSelected", className: "group-inner", components: [
			{name: "searching", kind: "VFlexBox", pack: "center", align: "center", components: [
				{name: "searchMessage", content: "", className: "search-message"},
				{kind: "Control", height: "10px"},
				{name: "searchSpinner", kind: "Spinner", showing: false },
			]},
			{name: "printerList", kind: "VirtualList", onSetupRow: "setupPrinterListRow", components: [
				{kind: "Item", className: "printer-list-item", tapHighlight: true, onclick: "clickPrinterListItem", components: [
					{kind: "VFlexBox", className: "printer-list-item-box", pack: "center", components: [
						{name: "printerName"},
						{name: "addPrinterButton", kind: "Button", onclick: "doAddPrinter"}
					]}
				]}
			]}
		]},
		{name: "addPrinterButton2", kind: "Button", caption: PrintDialogString.load("ADD_A_PRINTER"), onclick: "doAddPrinter"},
		{kind: "PrintManagerService", onFailure: "printManagerFailure", components: [
			{name: "findPrinters", method: "printers/list", subscribe: true, onSuccess: "findPrinterSuccess"},
			{name: "getCurrentPrinter", method: "printers/getCurrent", onSuccess: "getCurrentPrinterSuccess", onFailure: "getCurrentPrinterFailure"},
			{name: "setCurrentPrinter", method: "printers/setCurrent", onSuccess: "setCurrentPrinterSuccess", onFailure: "setCurrentPrinterFailure"}
		]}
	],
	
	//* @protected
	showingChanged: function() {
		this.inherited(arguments);

		// Refresh printer list when the printer selector is shown
		if (this.showing && this.printerItems && this.$.pane.getViewName() === "printerList") {
			this.$.printerList.refresh();
		}
	},
	
	resizeHandler: function() {
		// Only handle resize when the printer selector is shown
		if (this.showing) {
			this.inherited(arguments);
		}
	},
	
	//* @public
	loadPrinters: function() {
		if (!this.printerItems) {
			this.printerItems = [];
			this.printerIDs = {};
			this.currentPrinter = undefined;
			this.selectedPrinter = undefined;
			
			// Get current printer
			this.$.getCurrentPrinter.call();
			
			// Start searching for printers
			this.$.findPrinters.call();
			
			// Start search timeout
			this.startSearchTimeout();

			// Show searching view
			this.$.pane.selectViewByName("searching", true);
		}
	},
	
	//* @public
	freePrinters: function() {
		this.stopSearchTimeout();
		this.$.searchSpinner.hide();
		this.$.findPrinters.cancel();
		this.$.getCurrentPrinter.cancel();
		this.$.printerList.punt();
		delete this.selectedPrinter;
		delete this.currentPrinter;
		delete this.printerIDs;
		delete this.printerItems;
	},
	
	//* @public
	getCount: function() {
		return this.printerItems ? this.printerItems.length : 0;
	},

	//* @public
	selectPrinter: function(inPrinterID) {
		var printer = this.printerIDs[inPrinterID];
		if (printer !== undefined) {
			this.setSelectedPrinter(printer);
			return true;
		}
		return false;
	},

	startSearchTimeout: function() {
		if (!this.searchTimeoutID && this.searchTimeout > 0) {
			this.searchTimeoutID = setTimeout(enyo.hitch(this, "searchTimeoutExpired"), this.searchTimeout * 1000);
		}
	},
	
	stopSearchTimeout: function() {
		if (this.searchTimeoutID) {
			clearTimeout(this.searchTimeoutID);
			delete this.searchTimeoutID;
		}
	},
	
	searchTimeoutExpired: function() {
		this.stopSearchTimeout();
		if (this.printerItems.length === 0) {
			this.$.pane.selectViewByName("searching", true);
		}
	},
	
	selectedPrinterChanged: function() {	
		// Make selected printer as the current printer
		if (this.selectedPrinter !== this.currentPrinter) {
			this.currentPrinter = this.selectedPrinter;
			this.$.setCurrentPrinter.call({printerID: this.selectedPrinter.id});
		}
		this.doSelect(this.selectedPrinter);
	},
	
	viewSelected: function(inSender, inView, inPreviousView) {
		if (inView.name === "searching") {
			if (this.searchTimeoutID) {
				this.$.searchMessage.setContent(PrintDialogString.load("LOCATING_PRINTERS"));
				this.$.searchSpinner.show();
			}
			else {
				this.$.searchMessage.setContent(PrintDialogString.load("NO_PRINTERS_AVAILABLE"));
				this.$.searchSpinner.hide();
			}
			this.$.addPrinterButton2.show();
		}
		else {
			this.$.printerList.refresh();
			this.$.searchSpinner.hide();
			this.$.addPrinterButton2.hide();
		}
		this.doChangeCount(this.getCount());
	},
	
	setupPrinterListRow: function(inSender, inIndex) {
		if (this.printerItems) {
			var printerItem  = this.printerItems[inIndex];
			if (printerItem) {
				this.$.item.addRemoveClass("enyo-first", inIndex === 0);
				this.$.item.removeClass("enyo-last");
				this.$.printerName.setContent(printerItem.name);
				this.$.printerName.show();
				this.$.addPrinterButton.setCaption("");
				this.$.addPrinterButton.hide();
				return true;
			}
			else if (inIndex === this.printerItems.length) {
				this.$.item.addClass("enyo-last");
				this.$.printerName.setContent("");
				this.$.printerName.hide();
				this.$.addPrinterButton.setCaption(PrintDialogString.load("ADD_A_PRINTER"));
				this.$.addPrinterButton.show();
				return true;
			}
		}
		return false;
	},
	
	clickPrinterListItem: function(inSender, inEvent) {
		var printerItem = this.printerItems[inEvent.rowIndex];
		if (printerItem) {
			this.setSelectedPrinter(printerItem);
		};
	},
	
	addPrinterItem: function(inPrinter) {
		var printer = undefined;
		if (inPrinter && inPrinter.printerID) {
			printer = this.printerIDs[inPrinter.printerID];
			if (printer === undefined) {
				// Add new printer
				printer = this.printerIDs[inPrinter.printerID] = {id: inPrinter.printerID, name: inPrinter.printerName || inPrinter.printerID, address: inPrinter.printerAddress};
				this.printerItems.push(printer);
			}
			else {
				// Update existing printer
				printer.name = inPrinter.printerName;
				printer.address = inPrinter.printerAddress;
			}

			// Show printer list view
			this.$.pane.selectViewByName("printerList", true);
		}
		return printer;
	},
	
	removePrinterItem: function(inPrinter) {
		if (inPrinter && inPrinter.printerID) {
			var printer = this.printerIDs[inPrinter.printerID];
			if (printer !== undefined) {
				// Remove printer from printerItems
				for (var i=0; i<this.printerItems.length; i++) {
					if (this.printerItems[i].id === inPrinter.printerID) {
						this.printerItems.splice(i, 1);
						break;
					}
				}
				// Remove printer from printerIDs
				delete this.printerIDs[inPrinter.printerID];

				if (this.printerItems.length === 0) {
					// Show no printers found
					this.$.pane.selectViewByName("searching", true);
				}
				else {
					// Refresh printer list
					this.$.printerList.refresh();
				}
			}
		}
	},

	findPrinterSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		if (this.printerItems && inResponse.printerID) {
			switch (inResponse.eventType) {
			case "Add":
				this.addPrinterItem(inResponse);
				break;
			case "Rmv":
				this.removePrinterItem(inResponse);
				break;
			}
		}
	},
	
	getCurrentPrinterSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		if (inResponse.printerID) {
			this.currentPrinter = this.addPrinterItem(inResponse);
			if (this.currentPrinter !== undefined) {
				// Select current printer if no printer has been selected yet
				if (this.selectedPrinter === undefined) {
					this.log("Select current printer.");
					this.setSelectedPrinter(this.currentPrinter);
				}
			}
		}
	},
	getCurrentPrinterFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.currentPrinter = undefined;
	},
	
	setCurrentPrinterSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
	},
	setCurrentPrinterFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
	},

	printManagerFailure: function(inSender, inResponse) {
		this.log("inSender=", inSender.getName(), "inResponse=", inResponse);
	}
});
