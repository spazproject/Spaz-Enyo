/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.addressing.fetchLabelFromType = function(inContactType, inAddressType) {
	var labels = enyo.addressing.labels[inContactType];
	var label = labels && labels[inAddressType]
	return label && label.displayValue;
}

// Directory of address labels needed for addressing
enyo.addressing.labels = {
	emails: {
		type_home: {displayValue: enyo.addressing._$L('Home')},
		type_work: {displayValue: enyo.addressing._$L('Work')},
		type_other: {displayValue: enyo.addressing._$L('Other')}
	},
	//
	ims: {
		type_aim: {displayValue: enyo.addressing._$L('AIM')},
		type_yahoo: {displayValue: enyo.addressing._$L('Yahoo!')},
		type_gtalk: {displayValue: enyo.addressing._$L('GTalk')},
		type_msn: {displayValue: enyo.addressing._$L('Messenger')},
		type_jabber: {displayValue: enyo.addressing._$L('Jabber')},
		type_icq: {displayValue: enyo.addressing._$L('ICQ')},
		type_irc: {displayValue: enyo.addressing._$L('IRC')},
		type_qq: {displayValue: enyo.addressing._$L('QQ')},
		type_skype: {displayValue: enyo.addressing._$L('Skype')},
		type_yjp: {displayValue: enyo.addressing._$L('Y! Japan')},
		type_lcs: {displayValue: enyo.addressing._$L('LCS')},
		type_dotmac: {displayValue: enyo.addressing._$L('.Mac')},
		type_facebook: {displayValue: enyo.addressing._$L('Facebook')},
		type_myspace: {displayValue: enyo.addressing._$L('MySpace')},
		type_gadugadu: {displayValue: enyo.addressing._$L('GaduGadu')},
		type_default: {displayValue: enyo.addressing._$L('IM')}
	},
	//
	phoneNumbers: {
		type_mobile: {
			displayValue: enyo.addressing._$L('Mobile'),
			shortDisplayValue: enyo.addressing._$L('M')
		},
		type_home: {
			displayValue: enyo.addressing._$L('Home'),
			shortDisplayValue: enyo.addressing._$L('H')
		},
		type_home2: {
			displayValue: enyo.addressing._$L('Home 2'),
			shortDisplayValue: enyo.addressing._$L('H2')
		},
		type_work: {
			displayValue: enyo.addressing._$L('Work'),
			shortDisplayValue: enyo.addressing._$L('W')
		},
		type_work2: {
			displayValue: enyo.addressing._$L('Work 2'),
			shortDisplayValue: enyo.addressing._$L('W2')
		},
		type_main: {
			displayValue: enyo.addressing._$L('Main'),
			shortDisplayValue: enyo.addressing._$L('Ma')
		},
		type_personal_fax: {
			displayValue: enyo.addressing._$L('Fax'),
			shortDisplayValue: enyo.addressing._$L('P')
		},
		type_work_fax: {
			displayValue: enyo.addressing._$L('Fax'),
			shortDisplayValue: enyo.addressing._$L('F')
		},
		type_pager: {
			displayValue: enyo.addressing._$L('Pager'),
			shortDisplayValue: enyo.addressing._$L('P')
		},
		type_personal: {
			displayValue: enyo.addressing._$L('Personal'),
			shortDisplayValue: enyo.addressing._$L('Pe')
		},
		type_sim: {
			displayValue: enyo.addressing._$L('SIM'),
			shortDisplayValue: enyo.addressing._$L('S')
		},
		type_assistant: {
			displayValue: enyo.addressing._$L('Assistant'),
			shortDisplayValue: enyo.addressing._$L('A')
		},
		type_car: {
			displayValue: enyo.addressing._$L('Car'),
			shortDisplayValue: enyo.addressing._$L('Ca')
		},
		type_radio: {
			displayValue: enyo.addressing._$L('Radio'),
			shortDisplayValue: enyo.addressing._$L('R')
		},
		type_company: {
			displayValue: enyo.addressing._$L('Company'),
			shortDisplayValue: enyo.addressing._$L('C')
		},
		type_other: {
			displayValue: enyo.addressing._$L('Other'),
			shortDisplayValue: enyo.addressing._$L('O')
		}
	}
}
