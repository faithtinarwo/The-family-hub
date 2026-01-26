sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("family.dash.controller.App", {
        
        onInit: function () {
            // Apply content density (compact for desktop, cozy for touch)
            // This is a standard Fiori requirement for professional apps
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
        
    });
});