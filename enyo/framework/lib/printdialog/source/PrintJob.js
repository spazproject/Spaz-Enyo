/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The PrintJob is an abstraction of a print job. It contains the logic for creating a print job,
setting print parameters, getting final print parameters, and closing a print job. The pages 
of the print job are added through an abstract method 'addFiles' which is supplied by
the subclass.
*/
 
 enyo.kind({
	name: "PrintJob",
	kind: enyo.Component,
	printerID: "",
	appName: "",
	description: "",
	printerSettings: {},
	events: {
		onSuccess: "",
		onFailure: "",
		onCancel: ""
	},
	hideProgressDelay: 2,	// mininum time (in seconds) to delay hiding progress popup
	minProgressSteps: 3,	// progress steps for preparing print job

	create: function() {
		this.inherited(arguments);
		this.createComponents([
			{kind: "PrintManagerService", onFailure: "printManagerFailure", components: [
				{name: "openJob", method: "jobs/open", subscribe: true, onSuccess: "openJobSuccess"},
				{name: "setParams", method: "jobs/editPrintParams", onSuccess: "setParamsSuccess"},
				{name: "getFinalParams", method: "jobs/getFinalParamsAndArea", onSuccess: "getFinalParamsSuccess"},
				{name: "closeJob", method: "jobs/close", onSuccess: "closeJobSuccess"},
				{name: "cancelJob", method: "jobs/cancel", onSuccess: "cancelJobSuccess"},
				{name: "getStatus", method: "jobs/getStatus", subscribe: true, onSuccess: "getStatusSuccess"}
			]},
			{name: "launchPrintStatus", kind: "PalmService", service: "palm://com.palm.applicationManager/", 
				method: "open",
				params: {id: "com.palm.app.printmanager", params: {"$disableCardPreLaunch": true, "runHeadless": true}},
				onSuccess: "launchPrintStatusSuccess",
				onFailure: "launchPrintStatusFailure"},
			{name: "progressPopup", kind: "ProgressPopup", onClose: "closeProgressPopup", onCancel: "clickCancel"}
		]);
		this.startJob();
	},
	
	destroy: function() {
		// Clear all timers
		if (this.hideProgressTimeoutID) {
			clearTimeout(this.hideProgressTimeoutID);
			delete this.hideProgressTimeoutID;
		}
		
		this.inherited(arguments);
	},
	
	showProgressPopup: function() {
		var progressControl = this.$.progressPopup.getProgressControl();
		if (progressControl) {
			progressControl.setPosition(progressControl.getMinimum());
			progressControl.render();
		}
		this.$.progressPopup.showProgress(PrintDialogString.load("PREPARING_TO_PRINT"), " ");
	},
	
	updateProgressPopup: function() {
		var progressControl = this.$.progressPopup.getProgressControl();
		if (progressControl) {
			progressControl.setPosition(progressControl.getPosition() + 1);
			progressControl.render();
		}
	},
	
	hideProgressPopup: function() {
		// Destroy job immediately if job was canceled or failed
		if (this.jobCanceled || this.jobFailed || this.hideProgressDelay === 0) {
			this.destroy();
		}
		else {
			// Delay destroying job
			this.hideProgressTimeoutID = setTimeout(enyo.hitch(this, "destroy"), this.hideProgressDelay * 1000);
		}
	},

	closeProgressPopup: function(inSender, e, inReason) {
		if (this.jobCanceled) {
			this.doCancel();
		}
		else if (this.jobFailed) {
			this.doFailure(this.jobErrorText);
		}
		else {
			this.doSuccess();
		}
	},
	
	openJobSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.jobID = inResponse.jobID;
		this.updateProgressPopup();
		if (!this.jobCanceled) {
			// Call setParams minus page range settings
			var params = enyo.mixin({jobID: this.jobID}, this.printerSettings);
			if (params.pages) {
				delete params.pages;
			}
			this.log("setParams: ", params);
			this.$.setParams.call(params);
		}
		else {
			this.$.cancelJob.call({jobID: this.jobID});
		}
	},
	
	setParamsSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.updateProgressPopup();
		if (!this.jobCanceled) {
			this.$.getFinalParams.call({jobID: this.jobID});
		}
	},
	
	getFinalParamsSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.updateProgressPopup();
		if (!this.jobCanceled) {
			// Make a copy of final print params
			var printParams = enyo.clone(inResponse);
			delete printParams.returnValue;
			delete printParams.errorCode;

			// Add page range settings to print params
			if (this.printerSettings.pages) {
				printParams.pages = this.printerSettings.pages;
			}
		
			// Subscribe for status notifications so we know when the job is done
			this.$.getStatus.call();
			
			// Add files to print
			this.addFiles(printParams);
		}
	},

	// abstract: subclass must supply
	addFiles: function(inPrintParams) {
	},
	
	closeJobSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.finishJob();
	},
	
	cancelJobSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		this.finishJob();
	},
	
	getStatusSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
		if (inResponse.jobID === this.jobID && inResponse.printerState === "DONE") {
			switch (inResponse.jobStatus) {
			case "Success":
				break;
				
			case "Cancelled":
				// Job was canceled from another app or from the printer
				this.jobCanceled = true;
				break;
				
			case "Error":
			case "Corrupt":
			default:
				if (!this.jobFailed) {
					this.jobFailed = true;
					this.jobErrorText = PrintDialogString.load("PRINTING_ERROR");
				}
				break;
			}
			this.$.closeJob.call({jobID: this.jobID});
		}
	},
	
	printManagerFailure: function(inSender, inResponse, inRequest) {
		this.log("inSender=", inSender.getName(), "inResponse=", inResponse);
		switch (inSender.getName()) {
		case "closeJob":
			// Ignore error message and just end the job
			this.finishJob();
			break;			
		case "cancelJob":
			// Try to close job that we failed to cancel
			this.$.closeJob.call({jobID: this.jobID});
			break;
		default:
			this.jobFailed = true;
			this.jobErrorText = PrintManagerError.getErrorText(inResponse.errorCode);
			if (this.jobID) {
				this.$.closeJob.call({jobID: this.jobID});
			}
			else {
				this.finishJob();
			}
			break;
		}
	},
	
	clickCancel: function() {
		this.jobCanceled = true;
		if (this.jobID) {
			this.$.cancelJob.call({jobID: this.jobID});
		}
		this.$.progressPopup.setCaption(PrintDialogString.load("CANCELING_PRINT_JOB"));
	},
	
	launchPrintStatusSuccess: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
	},

	launchPrintStatusFailure: function(inSender, inResponse, inRequest) {
		this.log("inResponse=", inResponse);
	},
	
	startJob: function() {
		this.showProgressPopup();
		this.jobID = null;
		this.jobCanceled = false;
		this.jobFailed = false;
		this.jobErrorText = "";
		this.$.launchPrintStatus.call();
		this.$.openJob.call({printerID: this.printerID, description: this.description, appName: this.appName});
	},
	
	finishJob: function() {
		this.$.getStatus.cancel();
		this.hideProgressPopup();
	}
});
