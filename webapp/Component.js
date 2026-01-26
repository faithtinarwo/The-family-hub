sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device"
], function (UIComponent, Device) {
    "use strict";

    return UIComponent.extend("family.dash.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app.
         */
        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Create the views based on the url/hash
            this.getRouter().initialize();
        },

        /**
         * This method can be called to determine which density class to apply.
         */
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});