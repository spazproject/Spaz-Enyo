/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.depends(
	"source/PrintDialogString.js",
	"source/PrintManagerError.js",
	"source/PrintManagerService.js",
	"source/PrintJob.js",
	"source/ImagePrintJob.js",
	"source/DocumentPrintJob.js",
	"source/MessageBox.js",
	"source/ProgressPopup.js",
	"source/PrinterSelector.js",
	"source/MediaSizePicker.js",
	"source/MediaTypePicker.js",
	"source/PrintQualityPicker.js",
	"source/PrinterOptions.js",
	"source/PrinterAdder.js",
	"source/PrintDialog.js",
	"css/PrintDialog.css"
);

// Include stylesheet that hides print dialog in the printed output
document.write('<link href="' + enyo.path.rewrite("$enyo-lib/printdialog") + '/css/PrintMedia.css" media="print" rel="stylesheet" type="text/css" />');
