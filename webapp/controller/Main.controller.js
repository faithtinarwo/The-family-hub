sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Text"
], function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Button, Input, Text) {
    "use strict";

    return Controller.extend("family.dash.controller.Main", {
        onInit: function () {
            // 1. Setup Data
            var oData = {
                isAdmin: false,
                points: { Tina: 100, Anopa: 50, Anotida: 50 },
                shopping: [{ item: "Milk", bought: false }],
                history: []
            };

            // 2. Load Persisted Data
            try {
                var sSaved = localStorage.getItem("familyData");
                if (sSaved) {
                    var oSavedData = JSON.parse(sSaved);
                    Object.assign(oData, oSavedData);
                }
            } catch (e) {
                console.error("Local storage empty or corrupt.");
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "family");

            // 3. Listen for Chore updates to refresh the progress bar
            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oChoresModel) {
                oChoresModel.attachPropertyChange(this._updateProgress, this);
                // Also update when the page is first loaded
                this._updateProgress();
            }
        },

        /* =========================================================== */
        /* NAVIGATION & TILE INTERACTION                               */
        /* =========================================================== */

        onOpenChores: function () {
            // Sends the kids to the Chores view
            this.getOwnerComponent().getRouter().navTo("choresRoute");
        },

        onOpenShopping: function () {
            // Finds the shopping panel on the dashboard and scrolls to it
            var oPanel = this.byId("shoppingPanel");
            if (oPanel) {
                oPanel.setExpanded(true);
                oPanel.getDomRef().scrollIntoView({ behavior: 'smooth', block: 'start' });
                MessageToast.show("Opening Shopping List...");
            }
        },

        onOpenAdmin: function () {
            var oFamilyModel = this.getView().getModel("family");
            if (oFamilyModel.getProperty("/isAdmin")) {
                this.getOwnerComponent().getRouter().navTo("adminRoute");
            } else {
                this._showLoginDialog();
            }
        },

        /* =========================================================== */
        /* DASHBOARD LOGIC                                             */
        /* =========================================================== */

        itemsCount: function (aItems) {
            return aItems ? aItems.length : 0;
        },

        onAddItem: function () {
            var oModel = this.getView().getModel("family");
            var aShop = oModel.getProperty("/shopping") || [];
            var oInput = this.byId("addItemInput");
            var sNewItem = oInput.getValue();

            if (sNewItem) {
                aShop.push({ item: sNewItem, bought: false });
                oModel.setProperty("/shopping", aShop);
                oInput.setValue("");
                this._saveToLocal();
                MessageToast.show("Added to list");
            }
        },

        onDeleteItem: function (oEvent) {
            var oModel = this.getView().getModel("family");
            var sPath = oEvent.getSource().getBindingContext("family").getPath();
            var iIndex = parseInt(sPath.split("/").pop());
            var aShop = oModel.getProperty("/shopping");

            aShop.splice(iIndex, 1);
            oModel.setProperty("/shopping", aShop);
            this._saveToLocal();
        },

        _updateProgress: function () {
            var oProgress = this.byId("familyProgress");
            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oProgress && oChoresModel) {
                var aItems = oChoresModel.getProperty("/items") || [];
                var iRemaining = aItems.length;
                
                oProgress.setDisplayValue(iRemaining === 0 ? "All Done! 🎉" : iRemaining + " tasks to go!");
                // Simple logic: if 0 items, 100%. If items exist, show partial progress.
                oProgress.setPercentValue(iRemaining === 0 ? 100 : 40); 
                oProgress.setState(iRemaining === 0 ? "Success" : "Information");
            }
        },

        _saveToLocal: function () {
            var oData = this.getView().getModel("family").getData();
            localStorage.setItem("familyData", JSON.stringify(oData));
        },

        _showLoginDialog: function () {
            var oView = this.getView();
            var oInput = new Input({ id: "pinInput", type: "Password", placeholder: "PIN" });
            var oDialog = new Dialog({
                title: "Parental Gate",
                content: [new Text({ text: "Enter PIN (1234):" }), oInput],
                beginButton: new Button({
                    text: "Login",
                    press: function () {
                        if (oInput.getValue() === "1234") {
                            oView.getModel("family").setProperty("/isAdmin", true);
                            oDialog.close();
                            oView.getController().getOwnerComponent().getRouter().navTo("adminRoute");
                        } else {
                            MessageToast.show("Access Denied");
                        }
                    }
                }),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); } }),
                afterClose: function() { oDialog.destroy(); }
            });
            oDialog.open();
        }
    });
});