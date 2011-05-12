/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var PrintDialogString = (function() {
	var rb = new enyo.g11n.Resources({root: "$enyo-lib/printdialog"});
	var stringIDs = {
		"PRINT": rb.$L("Print"),
		"SELECT_A_PRINTER": rb.$L("Select a Printer"),
		"ADD_A_PRINTER": rb.$L("Add a Printer"),
		"CANCEL": rb.$L("Cancel"),
		"DONE": rb.$L("Done"),
		"LOCATING_PRINTERS": rb.$L("Locating Printers..."),
		"NO_PRINTERS_AVAILABLE": rb.$L("No printers are currently available."),
		"PRINTER_ID_HINT": rb.$L("Enter Printer IP address"),
		"PRINTER_NAME_HINT": rb.$L("Name Printer"),
		"NUMBER_OF_COPIES": rb.$L("Number of Copies"),
		"TWO_SIDED_PRINTING": rb.$L("2-Sided Printing"),
		"PAPER_SIZE": rb.$L("Size"),
		"PAPER_TYPE": rb.$L("Paper Type"),
		"COLOR_PRINTING": rb.$L("Color Printing"),
		"PAGE_RANGE": rb.$L("Page Range"),
		"PRINT_QUALITY": rb.$L("Print Quality"),
		"SELECT_ANOTHER_PRINTER": rb.$L("Select Another Printer"),
		"PHOTO_4x6": rb.$L("4x6"),
		"PHOTO_5x7": rb.$L("5x7"),
		"PHOTO_5x7_MAIN": rb.$L("5x7 (Main Tray)"),
		"PHOTO_10x15": rb.$L("10x15cm"),
		"PHOTO_13x18": rb.$L("13x18cm"),
		"PHOTO_13x18_MAIN": rb.$L("13x18cm (Main Tray)"),
		"PHOTO_L": rb.$L("L"),
		"HAGAKI": rb.$L("Hagaki"),
		"PHOTO_2L": rb.$L("2L"),
		"PHOTO_2L_MAIN": rb.$L("2L (Main Tray)"),
		"PLAIN": rb.$L("Plain"),
		"PHOTO": rb.$L("Photo"),
		"TRANSPARENCY": rb.$L("Transparency"),
		"DRAFT": rb.$L("Draft"),
		"NORMAL": rb.$L("Normal"),
		"BEST": rb.$L("Best"),
		"PREPARING_TO_PRINT": rb.$L("Preparing to print..."),
		"CANCELING_PRINT_JOB": rb.$L("Canceling print job..."),
		"IMAGE_X_OF_Y": rb.$L("Image #{num} of #{total}"),
		"PAGE_X_OF_Y": rb.$L("Page #{num} of #{total}"),
		"PAGE_X": rb.$L("Page #{num}"),
		"INVALID_PAGE_RANGE": rb.$L("You have entered an invalid page range. ('#{input}')"),
		"INVALID_PAGE_NUMBER": rb.$L("You have entered an invalid page number. ('#{input}')"),
		"PRINTER_ALREADY_EXISTS": rb.$L("This printer already exists."),
		"PRINTER_ALREADY_EXISTS_ZERO": rb.$L("This printer was automatically discovered and is already available."),
		"PRINTER_IP_NOT_VALID": rb.$L("The IP address for the printer is not valid. Check the address, then re-enter it."),
		"PRINTER_NOT_SUPPORTED": rb.$L("This printer is currently not supported.  Please select or add another printer."),
		"PRINTER_NO_RESPONSE_MANUAL": rb.$L("Unable to communicate with the printer. Please check the address, make sure the printer is online, and try again."),
		"PRINTING_ERROR": rb.$L("Unable to process print job."),
		"PRINTING_ERROR_WITH_NUMBER": rb.$L("Unable to process print job. (error #{error})"),
		"PRINTING_ERROR_TEMP_FILE_NO_ROOM": rb.$L("The printer queue is currently full. Please wait for a print job to finish before you start a new one. (error #{error})"),
		"COMMUNICATION_ERROR": rb.$L("Unable to communicate with the printer at this time. (error #{error})")
	};
	
	return {
		load: function(inStringID, inData) {
			var string = "";
			if (inStringID) {
				string = stringIDs[inStringID] || string;
				if (inData) {
					var template = new enyo.g11n.Template(string);
					string = template.evaluate(inData);
				}
			}
			return string;
		}
	}
}());
