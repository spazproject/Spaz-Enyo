/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var PrintManagerError = (function() {
	return {
		getErrorText: function(inErrorCode) {
			if (inErrorCode) {
				// User errors
				if (-200 >= inErrorCode && inErrorCode > -300) 
				{
					switch (inErrorCode) {
					case -204:	// PM_ERR_PRINTER_DUPLICATE_ID
					case -205:	// PM_ERR_PRINTER_DUPLICATE_IP
						return PrintDialogString.load("PRINTER_ALREADY_EXISTS");
					case -206:	// PM_ERR_PRINTER_IP_NOT_VALID
						return PrintDialogString.load("PRINTER_IP_NOT_VALID");
					case -233:	// PM_ERR_JOB_TEMP_FILE_NO_ROOM
						return PrintDialogString.load("PRINTING_ERROR_TEMP_FILE_NO_ROOM", {error: inErrorCode});
					case -243:	// PM_ERR_JOB_NO_JOB_HANDLES
						return PrintDialogString.load("PRINTING_ERROR_TRY_AGAIN", {error: inErrorCode});
					case -238:	// PM_ERR_PRINTER_NOT_SUPPORTED
						return PrintDialogString.load("PRINTER_NOT_SUPPORTED");

					// Errors to be depracated
					case -203:	// PM_ERR_PRINTER_NO_RESPONSE
					case -207:	// PM_ERR_PRINTER_GET_CAPS
					case -215:	// PM_ERR_JOB_ADDRESS_NOT_VALID
						return PrintDialogString.load("COMMUNICATION_ERROR", {error: inErrorCode});
					}
				}
				
				// Communication errors
				if (-400 >= inErrorCode && inErrorCode > -500) {
					return PrintDialogString.load("COMMUNICATION_ERROR", {error: inErrorCode});
				}
/***
				// Rendering errors
				else if (-300 >= inErrorCode && inErrorCode > -400) {
				}
				// Informational errors
				else if (-500 >= inErrorCode && inErrorCode > -600) {
				}
				// Programming errors
				else if (-600 >= inErrorCode && inErrorCode > -700) {
				}
				// System errors
				else if (-700 >= inErrorCode && inErrorCode > -800) {
				}
***/
				return PrintDialogString.load("PRINTING_ERROR_WITH_NUMBER", {error: inErrorCode});
			}
			return PrintDialogString.load("PRINTING_ERROR");
		}
	}
}());
