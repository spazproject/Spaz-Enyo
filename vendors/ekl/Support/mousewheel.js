////
// MOUSEWHEEL SUPPORT
////

//Add mousewheel to whitelist of dispatchable dom events
enyo.dispatcher.events = enyo.dispatcher.events.concat(["mouswheel"]);

//Add listener to document for mousewheel to forward to the enyo dispatcher
document.addEventListener("mousewheel", enyo.dispatch, false);

//Add feature to dispatcher to add data to event to handle multiple browsers
enyo.dispatcher.features.push(function(e) {
    if (e.type == "mousewheel") {
        //Everyone thank Brandon Aaron as I totally stole this from his jQuery mousewheel plugin
        //https://github.com/brandonaaron/jquery-mousewheel

        var delta = {
            comp: 0,
            x: 0,
            y: 0
        };

        if (e.wheelDelta) { delta.x = delta.comp = e.wheelDelta/12; }
        if (e.detail) { delta.x = delta.comp = -event.detail/3; }

        delta.y = delta.x;

        if (e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS) {
            delta.y = 0;
            delta.x = -1*delta.comp;
        }

        if (e.wheelDeltaY !== undefined) { delta.y = e.wheelDeltaY/12; }
        if (e.wheelDeltaX !== undefined) { delta.x = e.wheelDeltaX/12; }

        e.delta = delta;
    }
});