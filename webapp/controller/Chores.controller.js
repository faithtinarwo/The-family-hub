sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("family.dash.controller.Chores", {
        
        onTaskStatusChange: function (oEvent) {
            const bSelected = oEvent.getParameter("selected");
            const sTaskName = oEvent.getSource().getBindingContext("chores").getProperty("taskName");

            if (bSelected) {
                MessageToast.show("Great job! '" + sTaskName + "' marked as done.");
            }
        },

        onClaimRewards: function () {
            // Logic to filter completed chores and calculate points
            const aChores = this.getView().getModel("chores").getProperty("/items");
            const iCompletedCount = aChores.filter(item => item.completed).length;

            MessageToast.show("You are claiming rewards for " + iCompletedCount + " tasks!");
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("mainRoute", {}, true);
            }
        }
    });
});