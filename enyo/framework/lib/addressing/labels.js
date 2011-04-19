/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.addressing.fetchLabelFromType = function(inContactType, inAddressType) {
	var labels = enyo.addressing.labels[inContactType];
	var label = labels && labels[inAddressType]
	return label && label.displayValue;
}

// Directory of address labels needed for addressing
enyo.addressing.labels = {
	emails: {
		type_home: {displayValue: $L('Home')},
		type_work: {displayValue: $L('Work')},
		type_other: {displayValue: $L('Other')}
	},
	//
	ims: {
		type_aim: {displayValue: $L('AIM')},
		type_yahoo: {displayValue: $L('Yahoo!')},
		type_gtalk: {displayValue: $L('GTalk')},
		type_msn: {displayValue: $L('Messenger')},
		type_jabber: {displayValue: $L('Jabber')},
		type_icq: {displayValue: $L('ICQ')},
		type_irc: {displayValue: $L('IRC')},
		type_qq: {displayValue: $L('QQ')},
		type_skype: {displayValue: $L('Skype')},
		type_yjp: {displayValue: $L('Y! Japan')},
		type_lcs: {displayValue: $L('LCS')},
		type_dotmac: {displayValue: $L('.Mac')},
		type_facebook: {displayValue: $L('Facebook')},
		type_myspace: {displayValue: $L('MySpace')},
		type_gadugadu: {displayValue: $L('GaduGadu')},
		type_default: {displayValue: $L('IM')}
	},
	//
	phoneNumbers: {
		type_mobile: {
			displayValue: $L('Mobile'),
			shortDisplayValue: $L('M')
		},
		type_home: {
			displayValue: $L('Home'),
			shortDisplayValue: $L('H')
		},
		type_home2: {
			displayValue: $L('Home 2'),
			shortDisplayValue: $L('H2')
		},
		type_work: {
			displayValue: $L('Work'),
			shortDisplayValue: $L('W')
		},
		type_work2: {
			displayValue: $L('Work 2'),
			shortDisplayValue: $L('W2')
		},
		type_main: {
			displayValue: $L('Main'),
			shortDisplayValue: $L('Ma')
		},
		type_personal_fax: {
			displayValue: $L('Fax'),
			shortDisplayValue: $L('P')
		},
		type_work_fax: {
			displayValue: $L('Fax'),
			shortDisplayValue: $L('F')
		},
		type_pager: {
			displayValue: $L('Pager'),
			shortDisplayValue: $L('P')
		},
		type_personal: {
			displayValue: $L('Personal'),
			shortDisplayValue: $L('Pe')
		},
		type_sim: {
			displayValue: $L('SIM'),
			shortDisplayValue: $L('S')
		},
		type_assistant: {
			displayValue: $L('Assistant'),
			shortDisplayValue: $L('A')
		},
		type_car: {
			displayValue: $L('Car'),
			shortDisplayValue: $L('Ca')
		},
		type_radio: {
			displayValue: $L('Radio'),
			shortDisplayValue: $L('R')
		},
		type_company: {
			displayValue: $L('Company'),
			shortDisplayValue: $L('C')
		},
		type_other: {
			displayValue: $L('Other'),
			shortDisplayValue: $L('O')
		}
	}
}