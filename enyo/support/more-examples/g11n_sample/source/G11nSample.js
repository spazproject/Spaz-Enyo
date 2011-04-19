/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name:"G11nSample",
    kind:"Control",
    components: [
        {kind:"Header", content:"Globalization (G11n) Sample"},
        {name:"currentLocale", kind:"Button", caption:"current locale"},
        {name:"dateExample1", kind:"Button", caption:"date"},
        {name:"dateExample2", kind:"Button", caption:"date"},
        {name:"numberExample1", kind:"Button", caption:"date"},
        {name:"numberExample2", kind:"Button", caption:"date"},
        {name:"translateExample1", kind:"Button", caption:"date"},
        {name:"translateExample2", kind:"Button", caption:"date"},
    ],
    initComponents: function() {
        this.inherited(arguments);
        
        //check the current locale
        var locale = enyo.g11n.currentLocale();
        console.log("locale = " + locale);
        console.log("System language is: " + locale.language);
        console.log("Dialect of the system language is: " + locale.region);
        this.$.currentLocale.setCaption("current locale = " + locale);
        
        
        //format a date in the current locale
        var fmt = new enyo.g11n.DateFmt({
             date: "short",
             time: "short",
        });
        console.log("Current date is " + fmt.format(new Date()));
        this.$.dateExample1.setCaption("date in current locale = " + fmt.format(new Date()));
        
        
        //format a date in a specific locale
        var fmt2 = new enyo.g11n.DateFmt({
             date: "short",
             time: "short",
             locale: new enyo.g11n.Locale("en_ca")
        });
        console.log("Canadian date = " + fmt2.format(new Date()));
        this.$.dateExample2.setCaption("date in canadian = " + fmt2.format(new Date()));
        
        
        //format a number in the default locale
        var numfmt1 = new enyo.g11n.NumberFmt({
            fractionDigits: 1
        });
        console.log("Number format: " + numfmt1.format(33333.3));
        this.$.numberExample1.setCaption("number in default locale = " + numfmt1.format(33333.3));

        
        //format a number in a specific locale
        var numfmt2 = new enyo.g11n.NumberFmt({
            fractionDigits: 1,
            locale: new enyo.g11n.Locale("fr")
        });
        console.log("Number format: " + numfmt2.format(33333.3));
        this.$.numberExample2.setCaption("number in French locale = " + numfmt2.format(33333.3));
        
        console.log($L("Hello"));
        this.$.translateExample1.setCaption("Hello in default locale = " + $L("Hello"));
        
        var rb2 = new enyo.g11n.Resources({
            locale:"it_it"
        });
        console.log(rb2.$L("Hello"));
        this.$.translateExample2.setCaption("Hello in italian = " + rb2.$L("Hello"));

        
    }
});
