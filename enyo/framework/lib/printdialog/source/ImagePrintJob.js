/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The ImagePrintJob is a specialized PrintJob that prints images.
*/
enyo.kind({
	name: "ImagePrintJob",
	kind: "PrintJob",
	imagesToPrint: [],
	imagePath: "",
	components: [
		{name: "addFile", kind: "PrintManagerService", method: "jobs/addFile", onSuccess: "addFileSuccess", onFailure: "addFileFailure" }
	],

	startJob: function() {
		var progressControl = this.$.progressPopup.getProgressControl();
		if (progressControl) {
			progressControl.setMinimum(0);	
			progressControl.setMaximum(this.minProgressSteps + this.imagesToPrint.length);
		}
		// Force landscape images to be rotated to the orientation of photo paper
		this.printerSettings.autoRotate = true;
		// Force images to be resized up or down to fit the selected paper size
		this.printerSettings.autoScale = true;
		// Force images to be printed borderless when no margins are set
		if (this.printerSettings.topInset === undefined && this.printerSettings.leftInset === undefined && this.printerSettings.rightInset === undefined && this.printerSettings.bottomInset === undefined) {
			this.printerSettings.borderless = true;
		}
		// Force images to print on photo paper
		this.printerSettings.mediaType = "Photo";
		// Force images to print with best quality
		this.printerSettings.printQuality = "Best";
		this.inherited(arguments);
	},

	addFiles: function(inPrintParams) {
		this.log("inPrintParams=", inPrintParams);
		this.currentImage = 0;
		this.addNextImage();
	},
	
	addNextImage: function() {
		if (this.currentImage < this.imagesToPrint.length) {
			var currPage = this.currentImage + 1;
			var totPages = this.imagesToPrint.length;
			var imagePath = this.imagePath + this.imagesToPrint[this.currentImage];
			this.$.progressPopup.setMessage(PrintDialogString.load("IMAGE_X_OF_Y", {num: currPage, total: totPages}));
			this.log("Adding file '" + imagePath + "' ...");
			this.$.addFile.call({jobID: this.jobID, pathName: imagePath, currentPage: currPage, totalPages: totPages});
		}
		else {
			this.$.closeJob.call({jobID: this.jobID});
		}
	},
	
	addFileSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.updateProgressPopup();
		if (!this.jobCanceled) {
			this.currentImage++;
			this.addNextImage();
		}
	},
	
	addFileFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		switch (inResponse.errorCode) {
		case -219:	// PM_ERR_JOB_ADD_PAGE_FAILED
		case -703:
			if (!this.jobFailed) {
				this.jobFailed = true;
				this.jobErrorText = PrintManagerError.getErrorText(inResponse.errorCode);
			}
			// Wait for getStatus DONE to close the job.
			break;
		default:
			if (!this.jobFailed) {
				this.jobFailed = true;
				this.jobErrorText = PrintManagerError.getErrorText(inResponse.errorCode);
			}
			this.$.closeJob.call({jobID: this.jobID});
			break;
		}
	}
});
