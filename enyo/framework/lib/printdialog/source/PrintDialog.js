/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The PrintDialog is a popup that lets the user choose a printer, select print options and  
print a set of images or an app-specific rendered document.

You customize what print options are shown by setting the following properties:
	pageRange - sets the minimum and maximum number of pages that can be printed
	copiesRange - sets the minimum and maximum number of copies that can be printed
	duplexOption - allows user to select 2-sided printing
	mediaSizeOption - allows user to select media size
	mediaTypeOption - allows user to select media type
	colorOption - allows user to select color or monochrome printing
	qualityOption - allows user to select print quality
NOTE: none of the print options are shown by default.

You can use the following properties to set default values:
	margin - sets the default page margin for the print job (e.g., {top: 0.5, left: 0.5, right: 0.5, bottom: 0.5})

To print image files such as JPEG, use the imagesToPrint property to specify the image
file names. You can use the optional imagePath property to set a common root path which
is prepended to all the image file names.

Here's an example of how to use PrintDialog to print a set of images:

	{name: "printDialog", kind: "PrintDialog",
		copiesRange: {min: 1, max: 10},
		mediaSizeOption: true,
		colorOption: true,
		imagePath: "/media/internal/",
		imagesToPrint: ["image1.jpeg", "image2.jpeg", "image3.jpeg"],
		appName: "Photos"}
	
	this.$.printDialog.openAtCenter();


To print content from an application, use the frameToPrint property to specify the frame 
name. The frameToPrint property can be a string or a JSON object. If it's a string, then
it must specify the frame name to print. If it's a JSON object, then it must have a name 
property that specifies the frame name to print and an optional landscape property to 
indicate if the frame should be printed in landscape orientation. Set the frame name to 
an empty string ("") to print the main document. To customize what parts of the document
is hidden/shown in printed output, create a print css stylesheet and include a reference 
to it with the media='print' attribute.

Here's an example of how to use PrintDialog to print content from an application:

	{name: "printDialog", kind: "PrintDialog",
		duplexOption: true,
		colorOption: true,
		frameToPrint: {name:"", landscape:false},
		appName: "TestApp"}
	
	this.$.printDialog.openAtCenter();
	
PrintMedia.css - stylesheet for printed output:
	.enyo-button { display:none; }
	
depends.js - include stylesheet for printed output:
	document.write('<link href="PrintMedia.css" media="print" rel="stylesheet" type="text/css"/>');


To print a custom rendered document, use the onRenderDocument event to render the
document and add the rendered document to the print job.

Here's an example of how to use PrintDialog to print a web page from the browser:

	{name: "printDialog", kind: "PrintDialog",
		copiesRange: {min: 1, max: 10},
		duplexOption: true,
		colorOption: true,
		onRenderDocument: "renderWebPage",
		appName: "Browser"}
	
	this.$.printDialog.openAtCenter();
	
	renderWebPage: function(inSender, inJobID, inPrintParams) {
		this.$.view.callBrowserAdapter("printFrame",
			["",
			 inJobID,
			 inPrintParams.width,
			 inPrintParams.height,
			 inPrintParams.pixelUnits,
			 false, // print in portrait
			 inPrintParams.renderInReverseOrder]);
	}
*/
enyo.kind({
	name: "PrintDialog",
	kind: "ModalDialog",
	layoutKind: "VFlexLayout",
	contentHeight: "316px",
	published: {
		copiesRange: {min:1, max:25},
		duplexOption: false,		// None, Book, Tablet
		mediaSizeOption: false,		// US_Letter, US_Legal, ISO_A4, Photo_4x6
		mediaTypeOption: false,		// Plain, Special, Photo
		colorOption: false,			// Mono, Color
		pageRange: {min:0, max:0},
		qualityOption: false,		// Fast, Normal, Best
		margin: {},
		imagesToPrint: [],
		imagePath: "",
		frameToPrint: {},			// string or {name: "", landscape: <true/false>}
		description: "",
		appName: ""
	},
	events: {
		onRenderDocument: ""
	},
	strings: {
		PRINT: PrintDialogString.load("PRINT"),
		SELECT_A_PRINTER: PrintDialogString.load("SELECT_A_PRINTER"),
		ADD_A_PRINTER: PrintDialogString.load("ADD_A_PRINTER"),
		CANCEL: PrintDialogString.load("CANCEL"),
		DONE: PrintDialogString.load("DONE")
	},
	className: "enyo-popup enyo-modaldialog print-dialog",
	components: [
		{kind: "Pane", flex:1, className: "group", transitionKind: "enyo.transitions.Simple", onSelectView: "viewSelected", components: [
			{name: "printerSelector", kind: "PrinterSelector",
				onSelect: "printerSelected",
				onChangeCount: "printerSelectorCountChanged",
				onAddPrinter: "addPrinter"},
			{name: "printerOptions", kind: "PrinterOptions", lazy: true,
				onSelectPrinter: "selectPrinter",
				onShowOptions: "printerOptionsShown"},
			{name: "printerAdder", kind: "PrinterAdder", lazy: true, 
				onChangePrinterID: "addPrinterIDChanged",
				onEnterKeyDown: "addPrinterEnterKeyDown",
				onAddSuccess: "addPrinterSuccess", 
				onAddFailure: "addPrinterFailure"}
		]},
		{kind: "HFlexBox", pack: "justify", align: "center", defaultKind: "Button", components: [
			{name: "cancelButton", flex: 1, onclick: "clickCancel"},
			{name: "printButton", flex: 1, disabled: true, onclick: "clickPrint", className: "enyo-button-affirmative"}
		]}
	],
	
	componentsReady: function() {
		this.inherited(arguments);
		this.$.cancelButton.setCaption(this.strings.CANCEL);
		this.$.printButton.setCaption(this.strings.PRINT);
	},
	
	openAt: function(inRect) {
		// Open only if there is no active print job
		if (this.$.printJob === undefined) {
			this.inherited(arguments);
		}
	},
	
	open: function() {
		this.inherited(arguments);
		
		// Start locating printers
		this.$.pane.selectViewByName("printerSelector", true);
		this.$.printerSelector.loadPrinters();
	},
	
	close: function() {
		this.inherited(arguments);
		
		// Free printers
		this.$.printerSelector.freePrinters();
	},
	
	viewSelected: function(inSender, inView, inPreviousView) {
		var selectedPrinter;
		switch (inView.name) {
		case "printerSelector":
			// Update dialog title
			if (this.$.printerSelector.getCount() > 0) {
				this.setCaption(this.strings.SELECT_A_PRINTER);
			}
			else {
				this.setCaption(this.strings.PRINT);
			}
			
			// Disable print button
			this.$.printButton.setCaption(this.strings.PRINT);
			this.$.printButton.setDisabled(true);
			break;
			
		case "printerOptions":
			selectedPrinter = this.$.printerSelector.getSelectedPrinter();
			if (selectedPrinter) {
				// Set dialog title
				this.setCaption(this.strings.PRINT);

				// Disable print button
				this.$.printButton.setCaption(this.strings.PRINT);
				this.$.printButton.setDisabled(true);
				
				// Show printer options for selected printer
				this.$.printerOptions.setCopies(this.copiesRange);
				this.$.printerOptions.setDuplex(this.duplexOption);
				this.$.printerOptions.setMediaSize(this.mediaSizeOption);
				this.$.printerOptions.setMediaType(this.mediaTypeOption);
				this.$.printerOptions.setColor(this.colorOption);
				this.$.printerOptions.setPages(this.pageRange);
				this.$.printerOptions.setQuality(this.qualityOption);
				this.$.printerOptions.setPrinter(selectedPrinter);
			}
			break;
			
		case "printerAdder":
			// Update dialog title
			this.setCaption(this.strings.ADD_A_PRINTER);
			
			// Disable done button
			this.$.printButton.setCaption(this.strings.DONE);
			this.$.printButton.setDisabled(true);
			break;
		}
	},
	
	printerSelected: function(inSender, inPrinterSelected) {
		this.log("inPrinterSelected=", inPrinterSelected, "currentView=" + this.$.pane.getViewName());
		if (inPrinterSelected && this.$.pane.getViewName() !== "printerAdder") {
			this.$.pane.selectViewByName("printerOptions", true);
		}
	},

	printerSelectorCountChanged: function(inSender, inCount) {
		if (this.$.pane.getViewName() === "printerSelector") {
			if (inCount > 0) {
				this.setCaption(this.strings.SELECT_A_PRINTER);
			}
			else {
				this.setCaption(this.strings.PRINT);
			}
		}
	},

	addPrinter: function() {
		this.$.pane.selectViewByName("printerAdder", true);
	},

	selectPrinter: function() {
		this.$.pane.selectViewByName("printerSelector", true);
	},

	printerOptionsShown: function() {
		if (this.$.printButton) {
			this.$.printButton.setDisabled(false);
		}
	},
	
	getRenderingFunction: function() {
		if (this.onRenderDocument !== "") {
			return enyo.hitch(this, this.doRenderDocument);
		}
		if (typeof this.frameToPrint === "string" || typeof this.frameToPrint.name === "string") {
			return enyo.hitch(this, this.printFrame);
		}
	},
	
	printFrame: function(inJobID, inPrintParams) {
		this.log("inJobID=", inJobID, "inPrintParams=", inPrintParams);
		if (window.PalmSystem) {
			var frameName = this.frameToPrint;
			var landscape = false;
			if (typeof frameName !== "string") {
				frameName = this.frameToPrint.name;
				landscape = Boolean(this.frameToPrint.landscape);
			}
			PalmSystem.printFrame(frameName, inJobID, inPrintParams.width, inPrintParams.height, inPrintParams.pixelUnits, landscape, inPrintParams.renderInReverseOrder);
		}
	},

	getPrinterSettings: function() {
		// Get printer settings that user selected
		var printerSettings = this.$.printerOptions.getPrinterSettings();
		// Add insets only if margin is defined
		if (this.margin) {
			if (this.margin.top) {
				printerSettings.topInset = this.margin.top;
			}
			if (this.margin.left) {
				printerSettings.leftInset = this.margin.left;
			}
			if (this.margin.right) {
				printerSettings.rightInset = this.margin.right;
			}
			if (this.margin.bottom) {
				printerSettings.bottomInset = this.margin.bottom;
			}
		}
		return printerSettings;
	},
	
	clickPrint: function() {
		switch (this.$.pane.getViewName()) {
		case "printerOptions":
			var selectedPrinter = this.$.printerOptions.getPrinter();
			if (selectedPrinter && selectedPrinter.id) {
				try {
					var renderingFunction = this.getRenderingFunction();
					var printerSettings = this.getPrinterSettings();
					this.close();
					if (renderingFunction !== undefined) {
						this.createComponent({
							name: "printJob",
							kind: "DocumentPrintJob",
							printerID: selectedPrinter.id,
							appName: this.appName,
							description: this.description,
							printerSettings: printerSettings,
							onSuccess: "printJobSuccess",
							onFailure: "printJobFailure",
							onCancel: "printJobCanceled",
							renderDocumentFunction: renderingFunction
						});
					}
					else if (this.imagesToPrint.length > 0) {
						this.createComponent({
							name: "printJob",
							kind: "ImagePrintJob",
							printerID: selectedPrinter.id,
							appName: this.appName,
							description: this.description,
							printerSettings: printerSettings,
							onSuccess: "printJobSuccess",
							onFailure: "printJobFailure",
							onCancel: "printJobCanceled",
							imagesToPrint: this.imagesToPrint,
							imagePath: this.imagePath
						});
					}
					else {
						this.warn("Nothing to print. onRenderDocument is \"\", frameToPrint is not set, and imagesToPrint is empty.");
					}
				}
				catch (error) {
					this.warn(error);
					this.showMessage(error);
				}
			}
			break;
			
		case "printerAdder":
			this.$.printerAdder.addPrinter();
			this.$.printButton.setDisabled(true);
			break;
		}
	},
	clickCancel: function() {
		if (this.$.pane.getViewName() === "printerAdder") {
			this.$.printerAdder.cancel();
			this.$.pane.selectViewByName("printerSelector", true);
		}
		else {
			this.close();
		}
	},

	addPrinterIDChanged: function(inSender, inEvent, inValue) {
		this.$.printButton.setDisabled(inValue.length === 0);
	},
	addPrinterEnterKeyDown: function(inSender, inControl, inEvent) {
		if (!this.$.printButton.getDisabled()) {
			inControl.forceBlur();
			this.clickPrint();
		}
	},
	addPrinterSuccess: function(inSender, inPrinterID, inPrinterName) {
		this.log("inPrinterID=", inPrinterID, "inPrinterName=", inPrinterName);
		if (this.$.pane.getViewName() === "printerAdder") {
			this.$.pane.selectViewByName("printerSelector", true);
			this.$.printerSelector.selectPrinter(inPrinterID);
		}
	},
	addPrinterFailure: function(inSender, inErrorText) {
		this.log("inErrorText=", inErrorText);
		if (this.$.pane.getViewName() === "printerAdder") {
			this.$.printButton.setDisabled(false);
			this.showMessage(inErrorText);
		}
	},
	
	printJobSuccess: function(inSender) {
		this.log();
	},
	printJobFailure: function(inSender, inErrorText) {
		this.log("inErrorText=", inErrorText);
		this.showMessage(inErrorText);
	},
	printJobCanceled: function(inSender) {
		this.log();
	},
	
	showMessage: function(inMessage) {
		if (!this.$.messageBox) {
			this.createComponent({kind: "MessageBox", name: "messageBox"});
		}
		this.$.messageBox.showMessage(inMessage);
	}
});
