/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrinterOptionItem",
	kind: enyo.Item,
	layoutKind: "HFlexLayout", 
	tapHighlight: false, 
	align: "center", 
	className: "enyo-item printer-option-item"
});

enyo.kind({
	name: "PrinterOptions",
	kind: enyo.VFlexBox,
	published: {
		printer: undefined,
		copies: {min:0, max:0},
		mediaType: false,	// Plain, Special, Photo
		mediaSize: false,	// US_Letter, US_Legal, ISO_A4, Photo_4x6
		duplex: false,		// None, Book, Tablet
		color: false,		// Mono, Color
		pages: {min:0, max:0},
		quality: false		// Fast, Normal, Best
	},
	events: {
		onSelectPrinter: "",
		onShowOptions: ""
	},
	components: [
		{kind: "BasicScroller", flex: 1, className: "group-inner", layoutKind: "OrderedLayout", components: [
			{kind: "PrinterOptionItem", className: "selected-printer", components: [
				{name: "printerName"},
			]},
			{name: "copiesOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("NUMBER_OF_COPIES"), flex: 1, className: "label"},
				{name: "copiesPicker", kind: "IntegerPicker", label: ""},
			]},
			{name: "mediaTypeOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("PAPER_TYPE"), flex: 1, className: "label"},
				{name: "mediaTypePicker", kind: "MediaTypePicker"}
			]},
			{name: "mediaSizeOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("PAPER_SIZE"), flex: 1, className: "label"},
				{name: "mediaSizePicker", kind: "MediaSizePicker"} //this needs to be a ListSelector
			]},
			{name: "duplexOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("TWO_SIDED_PRINTING"), flex: 1, className: "label"},
				{name: "duplexButton", kind: "ToggleButton", state: false}
			]},
			{name: "colorOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("COLOR_PRINTING"), flex: 1, className: "label"},
				{name: "colorButton", kind: "ToggleButton", state: true}
			]},
			{name: "pagesOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("PAGE_RANGE"), flex: 1, className: "label"},
				{kind: "RowGroup", style:"width:80px", components: [{name: "pagesInput", kind: "Input", flex: 1, inputClassName: "pages-input", autocorrect: false, autoKeyModifier: "num-lock"}]}
			]},
			{name: "qualityOption", kind: "PrinterOptionItem", components: [
				{content: PrintDialogString.load("PRINT_QUALITY"), flex: 1, className: "label"},
				{name: "qualityPicker", kind: "PrintQualityPicker"}
			]},
			{name: "gettingCapabilities", kind: "Item", className: "enyo-last get-capabilities-item", layoutKind: "VFlexLayout", pack: "center", align: "center", components: [
				{name: "gettingCapabilitiesMessage", content: ""},
				{name: "gettingCapabilitiesSpinner", kind: "Spinner", showing: false}
			]},
			{kind: "Item", className: "enyo-first enyo-last", components: [
				{kind: "Button", caption: PrintDialogString.load("SELECT_ANOTHER_PRINTER"), onclick: "doSelectPrinter"}
			]}
		]},
		{name: "getCapabilities", kind: "PrintManagerService", method: "printers/getCapabilities", onSuccess: "getCapabilitiesSuccess", onFailure: "getCapabilitiesFailure"}
	],

	create: function() {
		this.inherited(arguments);
		this.printerChanged();
		this.copiesChanged();
		this.mediaTypeChanged();
		this.mediaSizeChanged();
		this.duplexChanged();
		this.colorChanged();
		this.pagesChanged();
		this.qualityChanged();
	},
	
	printerChanged: function() {
		if (this.printer) {
			this.$.printerName.setContent(this.printer.name);
			this.$.basicScroller.setScrollTop(0);
			if (!this.printer.capabilities) {
				this.hidePrinterOptions();
			}
			else {
				this.showPrinterOptions();
			}
		}
	},

	copiesChanged: function() {
		var show = (this.copies && this.copies.min > 0 && this.copies.max > this.copies.min);
		if (show) {
			this.$.copiesPicker.setMin(this.copies.min);
			this.$.copiesPicker.setMax(this.copies.max);
			this.$.copiesPicker.setValue(this.copies.min);
		}
		this.$.copiesOption.setShowing(show);
	},

	mediaTypeChanged: function() {
		this.$.mediaTypeOption.setShowing(this.mediaType && this.$.mediaTypePicker.items.length > 0);
	},

	mediaSizeChanged: function() {
		this.$.mediaSizeOption.setShowing(this.mediaSize && this.$.mediaSizePicker.items.length > 0);
	},

	duplexChanged: function() {
		this.$.duplexOption.setShowing(this.duplex);
	},

	colorChanged: function() {
		this.$.colorOption.setShowing(this.color);
	},

	pagesChanged: function() {
		var show = (this.pages && this.pages.min > 0 && this.pages.max > this.pages.min);
		if (show) {
			this.$.pagesInput.setValue(String(this.pages.min) + "-" + String(this.pages.max));
		}
		this.$.pagesOption.setShowing(show);
	},

	qualityChanged: function() {
		this.$.qualityOption.setShowing(this.quality && this.$.qualityPicker.items.length > 0);
	},

	hidePrinterOptions: function() {
		// Hide all printer options except printer name and select printer button
		var controls = this.$.basicScroller.getControls();
		for (var i=1; i<controls.length-1; i++) {
			controls[i].hide();
		}
		
		// Get printer capabilities
		this.$.gettingCapabilitiesMessage.setContent("");
		this.$.gettingCapabilitiesSpinner.show();
		this.$.gettingCapabilities.show();
		this.$.getCapabilities.call({printerID: this.printer.id});
	},
	
	showPrinterOptions: function() {
		var	caps = this.printer ? this.printer.capabilities : undefined;
		
		// Show copies option
		this.copiesChanged();

		// Show pages option
		this.pagesChanged();

		// Show options based on printer capabilities
		if (caps) {
			var i, items;

			// Show media type option
			this.$.mediaTypePicker.setItems(caps.mediaType);
			this.$.mediaTypeOption.setShowing(this.mediaType && this.$.mediaTypePicker.items.length > 0);

			// Show media size option
			this.$.mediaSizePicker.setItems(caps.mediaSize);
			this.$.mediaSizeOption.setShowing(this.mediaSize && this.$.mediaSizePicker.items.length > 0);
			
			// Show duplex option
			this.$.duplexOption.setShowing(this.duplex && caps.canDuplex);

			// Show color option
			this.$.colorOption.setShowing(this.color && caps.hasColor);

			// Show quality option
			this.$.qualityPicker.setItems(caps);
			this.$.qualityOption.setShowing(this.quality && this.$.qualityPicker.items.length > 0);
		}
		else {
			// Hide all options that are based on printer capabilities
			this.$.mediaTypeOption.setShowing(false);
			this.$.mediaSizeOption.setShowing(false);
			this.$.duplexOption.setShowing(false);
			this.$.colorOption.setShowing(false);
			this.$.qualityOption.setShowing(false);
		}

		// Hide getting capabilities
		this.$.gettingCapabilities.hide();
		this.$.gettingCapabilitiesSpinner.hide();
		this.doShowOptions();
	},
	
	getCapabilitiesSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
		if (this.printer.id === inRequest.params.printerID) {
			this.printer.capabilities = inResponse;
		}
		this.showPrinterOptions();
	},
	getCapabilitiesFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse, "inRequest=", inRequest);
		this.$.gettingCapabilitiesSpinner.hide();
		this.$.gettingCapabilitiesMessage.setContent(PrintManagerError.getErrorText(inResponse.errorCode));
	},
	
	parsePageRange: function(inString) {
		var pageNumbers = [];
		var items = inString.split(',');
		for (var i=0; i<items.length; i++) {
			var subitems = items[i].split('-');
			if (subitems.length > 2) {
				throw PrintDialogString.load("INVALID_PAGE_RANGE", {input:items[i]});
			}
			else if (subitems.length == 2) {
				var start = Number(subitems[0]);
				var end = Number(subitems[1]);
				if (isNaN(start) || isNaN(end) || start>end || start<this.pages.min || end<this.pages.min || start>this.pages.max || end>this.pages.max) {
					throw PrintDialogString.load("INVALID_PAGE_RANGE", {input:items[i]});
				}
				for (; start<=end; start++) {
					pageNumbers.push(start);
				}
			}
			else {
				var page = Number(subitems[0]);
				if (isNaN(page) || page<this.pages.min || page>this.pages.max) {
					throw PrintDialogString.load("INVALID_PAGE_NUMBER", {input:items[i]});
				}
				pageNumbers.push(page);
			}
		}
		return pageNumbers;
	},
	
	//* @public
	getPrinterSettings: function() {
		var printerSettings = {};
		
		if (this.$.copiesOption.getShowing()) {
			printerSettings.numCopies = this.$.copiesPicker.getValue();
		}

		if (this.printer && this.printer.id) {
			if (this.$.mediaTypeOption.getShowing()) {
				printerSettings.mediaType = this.$.mediaTypePicker.getValue();
			}
			if (this.$.mediaSizeOption.getShowing()) {
				printerSettings.mediaSize = this.$.mediaSizePicker.getValue();
			}
			if (this.$.duplexOption.getShowing()) {
				printerSettings.duplex = this.$.duplexButton.getState() ? "Book" : "None";
			}
			if (this.$.colorOption.getShowing()) {
				printerSettings.color = this.$.colorButton.getState() ? "Color" : "Mono";
			}
			if (this.$.pagesOption.getShowing()) {
				printerSettings.pages = this.parsePageRange(this.$.pagesInput.getValue());
			}
			if (this.$.qualityOption.getShowing()) {
				printerSettings.printQuality = this.$.qualityPicker.getValue();
			}
		}
		
		return printerSettings;
	}
});
