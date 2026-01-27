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
                // Ensure this matches the route name in your manifest.json
                this.getOwnerComponent().getRouter().navTo("targetMain", {}, true);
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
            
            this._saveAllData();
        },

        onCompleteChore: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("chores");
            var oChore = oContext.getObject();
            var oFamilyModel = this.getView().getModel("family");
            
            // Add points to the specific person
            var iCurrentPoints = oFamilyModel.getProperty("/points/" + oChore.assignedTo) || 0;
            oFamilyModel.setProperty("/points/" + oChore.assignedTo, iCurrentPoints + parseInt(oChore.points));
            
            // Remove the chore from the list using the event
            this.onDeleteChore(oEvent);
            
            MessageToast.show("Points awarded to " + oChore.assignedTo + "!");
            this._saveAllData();
        },

        onDeleteChore: function (oEvent) {
            var oModel = this.getView().getModel("chores");
            var sPath = oEvent.getSource().getBindingContext("chores").getPath();
            var iIndex = parseInt(sPath.split("/").pop());
            var aItems = oModel.getProperty("/items");

            aItems.splice(iIndex, 1);
            oModel.setProperty("/items", aItems);
            
            this._saveAllData();
        },

        onResetWeeklyPoints: function () {
            var oFamilyModel = this.getView().getModel("family");
            var self = this;

            MessageBox.warning("Are you sure you want to reset all points to zero?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oFamilyModel.setProperty("/points", { Tina: 0, Anopa: 0, Anotida: 0 });
                        MessageToast.show("All points have been reset.");
                        self._saveAllData();
                    }
                }
            });
        },

        onPurgeHistory: function (oEvent) {
            var sKey = oEvent.getSource().getKey();
            var oFamilyModel = this.getView().getModel("family");
            
            if (sKey === "all") {
                oFamilyModel.setProperty("/shopping", []);
                MessageToast.show("Shopping list cleared.");
            } else {
                MessageToast.show("History purge for " + sKey + " days simulated.");
            }
            this._saveAllData();
        },

        /**
         * INTERNAL: Save both models to LocalStorage so data persists on refresh
         */
        _saveAllData: function() {
            var oFamilyData = this.getView().getModel("family").getData();
            var oChoresData = this.getView().getModel("chores").getData();
            
            localStorage.setItem("familyData", JSON.stringify(oFamilyData));
            localStorage.setItem("choresData", JSON.stringify(oChoresData));
        }
    });
});