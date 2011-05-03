/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "MediaSizePicker",
	kind: enyo.ListSelector,
	label: "",
	
	itemsChanged: function() {
		// Filter media size list based on region
		var mediaSizeStrings = this.getMediaSizeStrings();
		var mediaSizes = this.items || [];
		this.items = [];
		for (var i=0; i<mediaSizes.length; i++)
		{
			var mediaSize = mediaSizes[i];
			if (mediaSizeStrings[mediaSize]) {
				this.items.push({caption: mediaSizeStrings[mediaSize], value: mediaSize});
			}
		}
		// Call base implementation to populate picker list
		this.inherited(arguments);
		// Select default media size
		this.setDefaultMediaSize();
	},
	
	setDefaultMediaSize: function() {
		if (this.items.length > 0) {
			var region = enyo.g11n.formatLocale().getRegion();			
			if (region === "jp") {
				this.setValue("Photo_L");
			}
			else {
				this.setValue("Photo_4x6");
			}
		}
	},
	
	isEurope: function(inRegion) {
		switch (inRegion) {
		case "ax":	// Åland Islands
		case "al":	// Albania
		case "ad":	// Andorra
		case "at":	// Austria
		case "by":	// Belarus
		case "be":	// Belgium
		case "ba":	// Bosnia and Herzegovina
		case "bg":	// Bulgaria
		case "hr":	// Croatia
		case "cz":	// Czech Republic
		case "dk":	// Denmark
		case "ee":	// Estonia
		case "fo":	// Faroe Islands
		case "fi":	// Finland
		case "fr":	// France
		case "de":	// Germany
		case "gi":	// Gibraltar
		case "gr":	// Greece
		case "gg":	// Guernsey
		case "va":	// Holy See
		case "hu":	// Hungary
		case "is":	// Iceland
		case "ie":	// Ireland
		case "im":	// Isle of Man
		case "it":	// Italy
		case "je":	// Jersey
		case "lv":	// Latvia
		case "li":	// Liechtenstein
		case "lt":	// Lithuania
		case "lu":	// Luxembourg
		case "mk":	// Macedonia
		case "mt":	// Malta
		case "md":	// Moldova
		case "mc":	// Monaco
		case "me":	// Montenegro
		case "nl":	// Netherlands
		case "no":	// Norway
		case "pl":	// Poland
		case "pt":	// Portugal
		case "ro":	// Romania
		case "ru":	// Russian
		case "sm":	// San Marino
		case "rs":	// Serbia
		case "sk":	// Slovakia
		case "si":	// Slovenia
		case "es":	// Spain
		case "sj":	// Svalbard & Jan Mayen Islands
		case "se":	// Sweden
		case "ch":	// Switzerland
		case "ua":	// Ukraine
		case "gb":	// United Kingdom of Great Britain & Northern Ireland
			return true;
		}
		return false;
	},
	
	isLatinAmerica: function(inRegion) {
		switch (inRegion) {
		case "ar":	// Argentina
		case "bo":	// Bolivia
		case "br":	// Brazil
		case "cl":	// Chile
		case "co":	// Colombia
		case "cr":	// Costa Rica
		case "cu":	// Cuba
		case "do":	// Dominican Republic
		case "ec":	// Ecuador
		case "sv":	// El Salvador
		case "gt":	// Guatemala
		case "hn":	// Honduras
		case "mx":	// Mexico
		case "ni":	// Nicaragua
		case "pa":	// Panama
		case "py":	// Paraguay
		case "pe":	// Peru
		case "pr":	// Puerto Rico
		case "uy":	// Uruguay
		case "ve":	// Venezuela
			return true;
		}
		return false;
	},
	
	getMediaSizeStrings: function() {
		var region = enyo.g11n.formatLocale().getRegion();	
		// US, Canada
		if (region === "us" || region === "ca") {
			return {
				Photo_4x6: PrintDialogString.load("PHOTO_4x6"),
				Photo_5x7: PrintDialogString.load("PHOTO_5x7"),
				Photo_5x7_MainTray: PrintDialogString.load("PHOTO_5x7_MAIN")
			};
		}
		// Japan
		if (region === "jp") {
			return {
				Photo_L: PrintDialogString.load("PHOTO_L"),
				HAGAKI: PrintDialogString.load("HAGAKI"),
				Photo_5x7: PrintDialogString.load("PHOTO_2L"),
				Photo_5x7_MainTray: PrintDialogString.load("PHOTO_2L_MAIN")
			};
		}
		// Europe, Latin America
		if (this.isEurope(region) || this.isLatinAmerica(region)) {
			return {
				Photo_4x6: PrintDialogString.load("PHOTO_10x15"),
				Photo_5x7: PrintDialogString.load("PHOTO_13x18"),
				Photo_5x7_MainTray: PrintDialogString.load("PHOTO_13x18_MAIN")
			};
		}
		// Asia Pacific
		return {
			Photo_4x6: PrintDialogString.load("PHOTO_4x6"),
			Photo_5x7: PrintDialogString.load("PHOTO_5x7"),
			Photo_5x7_MainTray: PrintDialogString.load("PHOTO_5x7_MAIN")
		};
	}
});
