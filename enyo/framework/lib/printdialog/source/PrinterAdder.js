/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrinterAdder",
	kind: enyo.VFlexBox,
	align: "center",
	events: {
		onChangePrinterID: "",
		onChangePrinterName: "",
		onEnterKeyDown: "",
		onAddSuccess: "",
		onAddFailure: ""
	},
	components: [
		{kind: "Control", flex: 1, className: "group-inner", components: [
			{kind: "Item", className: "enyo-first", components: [
				{kind: "VFlexBox", components: [
					{kind: "RowGroup", components: [{name: "printerID", kind: "Input", hint: PrintDialogString.load("PRINTER_ID_HINT"),
						value: "", 
						oninput: "doChangePrinterID",
						onkeydown: "inputKeydown"}]},
					{kind: "RowGroup", components: [{name: "printerName", kind: "Input", hint: PrintDialogString.load("PRINTER_NAME_HINT"),
						value: "",
						oninput: "doChangePrinterName",
						onkeydown: "inputKeydown"}]},
				]}
			]},
			{height: "20px"},
			{kind: "HFlexBox", pack: "center", components: [
				{name: "spinner", kind: "Spinner", showing: false}
			]}
		]},
		{name: "addPrinter", kind: "PrintManagerService", method: "printers/add", onSuccess: "addPrinterSuccess", onFailure: "addPrinterFailure"}
	],

	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			this.$.printerID.setValue("");
			this.$.printerName.setValue("");
		}
	},
	
	inputKeydown: function(inSender, inEvent) {
		if (inEvent.keyCode == 13) {
			this.doEnterKeyDown(inSender, inEvent);
		}
	},
	
	//* @public
	addPrinter: function() {
		var printerID = this.$.printerID.getValue();
		var printerName = this.$.printerName.getValue();
		this.$.addPrinter.call({printerID: printerID, printerName: printerName, printerAddress: printerID});
		this.$.spinner.show();
	},
	
	//* @public
	cancel: function() {
		this.$.addPrinter.cancel();
		this.$.spinner.hide();
	},
	
	addPrinterSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
		this.$.spinner.hide();
		this.doAddSuccess(inRequest.params.printerID, inRequest.params.printerName);
	},
	
	addPrinterFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
		this.$.spinner.hide();
		this.doAddFailure(PrintManagerError.getErrorText(inResponse.errorCode));
	}
});
