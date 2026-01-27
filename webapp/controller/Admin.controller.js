sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("family.dash.controller.Admin", {
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("home", {}, true);
            }
        },

        onCreateChore: function () {
            var oModel = this.getView().getModel("chores");
            var aItems = oModel.getProperty("/items") || [];
            var sTask = this.byId("inputNewChore").getValue();

            if (!sTask) {
                return MessageToast.show("Please enter a task name");
            }

            aItems.push({
                taskName: sTask,
                assignedTo: this.byId("selectAssignee").getSelectedKey(),
                points: this.byId("stepPoints").getValue(),
                completed: false
            });

            oModel.setProperty("/items", aItems);
            this.byId("inputNewChore").setValue("");
            MessageToast.show("Task Assigned!");
        },

        onCompleteChore: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("chores");
            var oChore = oContext.getObject();
            var oFamilyModel = this.getView().getModel("family");
            
            // Add points to the specific person
            var iCurrentPoints = oFamilyModel.getProperty("/points/" + oChore.assignedTo) || 0;
            oFamilyModel.setProperty("/points/" + oChore.assignedTo, iCurrentPoints + parseInt(oChore.points));
            
            // Remove the chore from the list
            this.onDeleteChore(oEvent);
            MessageToast.show("Points awarded to " + oChore.assignedTo + "!");
        },

        onDeleteChore: function (oEvent) {
            var oModel = this.getView().getModel("chores");
            var sPath = oEvent.getSource().getBindingContext("chores").getPath();
            var iIndex = parseInt(sPath.split("/").pop());
            var aItems = oModel.getProperty("/items");

            aItems.splice(iIndex, 1);
            oModel.setProperty("/items", aItems);
        },

        onResetWeeklyPoints: function () {
            var oFamilyModel = this.getView().getModel("family");
            MessageBox.warning("Are you sure you want to reset all points to zero?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oFamilyModel.setProperty("/points", { Tina: 0, Anopa: 0, Anotida: 0 });
                        MessageToast.show("All points have been reset.");
                    }
                }
            });
        }
    });
});