sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("family.dash.controller.Chores", {
        onInit: function () {
            // This is where we will eventually load your chores data
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("home", {}, true);
            }
        },

        onClaimRewards: function () {
            MessageToast.show("Rewards claimed! Check your points balance.");
        }
    });
});