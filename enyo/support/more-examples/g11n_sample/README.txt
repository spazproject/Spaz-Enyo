This sample shows the basic usage of Globalization support in Enyo.
For full details on the entire Globalization API see the Enyo docs.

This sample shows how to:

* determine the user's current locale
* format a date using a particular locale
* format a number using a particular locale
* translate a text string using a locale specific resource file.



A note on the resources/*.json translation files.  These *must* be 
wellformed and cannot have a trailing comma, unlike javascript code.
The following will fail silently due to the comma after "Au revoir".

fr.json
{
    "Hello":"Bonjour",
    "Good Bye":"Au revoir",
}

If you remove the trailing comma it will work fine.
