/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The DocumentPrintJob is a specialized PrintJob that prints custom rendered documents.
*/
enyo.kind({
	name: "DocumentPrintJob",
	kind: "PrintJob",
	renderDocumentFunction: undefined,
	components: [
		{name: "getRenderStatus", kind: "PrintManagerService", method: "jobs/getRenderStatus", subscribe: true, onSuccess: "getRenderStatusSuccess", onFailure: "printManagerFailure" }
	],

	startJob: function() {
		var progressControl = this.$.progressPopup.getProgressControl();
		if (progressControl) {
			progressControl.setMinimum(0);
			// Set max to 100 until we get the total number of pages
			progressControl.setMaximum(100);
		}
		// Set default insets if none were specified
		if (this.printerSettings.topInset === undefined && this.printerSettings.leftInset === undefined && this.printerSettings.rightInset === undefined && this.printerSettings.bottomInset === undefined) {
			this.printerSettings.topInset = 0.5;
			this.printerSettings.leftInset = 0.5;
			this.printerSettings.rightInset = 0.5;
			this.printerSettings.bottomInset = 0.5;
		}
		// Set default paper size based on current locale
		if (this.printerSettings.mediaSize === undefined) {
			var fmts = new enyo.g11n.Fmts();
			var size = fmts.getDefaultPaperSize();
			this.printerSettings.mediaSize = (size === "A4") ? "ISO_A4" : "US_Letter";
		}
		this.inherited(arguments);
	},
	
	finishJob: function() {
		this.$.getRenderStatus.cancel();
		this.inherited(arguments);
	},

	addFiles: function(inPrintParams) {
		this.log("inPrintParams=", inPrintParams);
		if (this.renderDocumentFunction !== undefined) {
			// Subscribe for render status notifications
			this.$.getRenderStatus.call();

			// Call renderDocumentFunction
			this.log("Call renderDocumentFunction( jobID=" + this.jobID + ", printParams=" + JSON.stringify(inPrintParams) + " )");
			this.renderDocumentFunction(this.jobID, inPrintParams);
		}
		else {
			// Close the job
			this.$.closeJob.call({jobID: this.jobID});
		}
	},

	getRenderStatusSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		if (inResponse.jobID === this.jobID) {
			// Update progress bar
			var progressControl = this.$.progressPopup.getProgressControl();
			if (progressControl) {
				if (inResponse.totalPages > 0 && progressControl.maximum !== (this.minProgressSteps + inResponse.totalPages)) {
					// Update max position for progress control
					progressControl.setMaximum(this.minProgressSteps + inResponse.totalPages);
				}
				if (inResponse.currentPage > 0) {
					// Update progress position
					progressControl.setPosition(this.minProgressSteps + inResponse.currentPage);
				}
				progressControl.render();
			}
			
			// Update progress message
			if (inResponse.currentPage > 0) {
				var message;
				if (inResponse.totalPages > 0) {
					message = PrintDialogString.load("PAGE_X_OF_Y", {num: inResponse.currentPage, total: inResponse.totalPages});
				}
				else {
					message = PrintDialogString.load("PAGE_X", {num: inResponse.currentPage});
				}
				this.$.progressPopup.setMessage(message);
			}
			
			// Check if job has finished rendering
			if (inResponse.renderResultCode !== undefined) {
				switch (inResponse.renderResultCode) {
				case 0:		// RENDER_STATUS_DONE
					this.$.closeJob.call({jobID: this.jobID});
					break;
				case -502:	// PM_ERR_JOB_CANCEL_REQUESTED
					this.jobCanceled = true;
					this.$.closeJob.call({jobID: this.jobID});
					break;
				case -703:	// PM_ERR_JOB_ADD_PAGE_FAILED
					if (!this.jobFailed) {
						this.jobFailed = true;
						this.jobErrorText = PrintManagerError.getErrorText(inResponse.renderResultCode);
					}
					// Wait for getStatus DONE to close the job.
					break;
				default:
					if (!this.jobFailed) {
						this.jobFailed = true;
						this.jobErrorText = PrintManagerError.getErrorText(inResponse.renderResultCode);
					}
					this.$.closeJob.call({jobID: this.jobID});
					break;
				}
			}
		}
	}
});
