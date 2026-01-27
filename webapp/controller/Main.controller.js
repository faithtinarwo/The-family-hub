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
            // Default data structure
            var oData = {
                isAdmin: false,
                points: { Tina: 100, Anopa: 50, Anotida: 50 },
                shopping: [{ item: "Milk", bought: false }],
                history: []
            };

            // Victory Lap: Load from Local Storage
            try {
                var sSaved = localStorage.getItem("familyData");
                if (sSaved) {
                    var oSavedData = JSON.parse(sSaved);
                    oData.points = oSavedData.points || oData.points;
                    oData.shopping = oSavedData.shopping || oData.shopping;
                    oData.history = oSavedData.history || oData.history;
                }
            } catch (e) {
                console.error("Local storage empty, using defaults.");
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "family");

            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oChoresModel) {
                oChoresModel.attachRequestCompleted(function() {
                    this._updateProgress();
                }.bind(this));
            }
        },

        /* =========================================================== */
        /* FORMATTERS & HELPERS                                        */
        /* =========================================================== */

        itemsCount: function (aItems) {
            return aItems ? aItems.length : 0;
        },

        _saveToLocal: function () {
            var oData = this.getView().getModel("family").getData();
            var oDataToSave = Object.assign({}, oData);
            oDataToSave.isAdmin = false; // Security: Always lock on save
            localStorage.setItem("familyData", JSON.stringify(oDataToSave));
        },

        /* =========================================================== */
        /* SECURITY: THE PIN GATE                                      */
        /* =========================================================== */

        onOpenAdmin: function () {
            var oFamilyModel = this.getView().getModel("family");
            if (oFamilyModel.getProperty("/isAdmin")) {
                this.getOwnerComponent().getRouter().navTo("adminRoute");
            } else {
                this._showLoginDialog();
            }
        },

        _showLoginDialog: function () {
            var oView = this.getView();
            var oInput = new Input({ 
                id: "pinInput",
                type: "Password", 
                placeholder: "Enter PIN", 
                textAlign: "Center"
            });
            
            var oDialog = new Dialog({
                title: "Parental Gate",
                type: "Message",
                content: [new Text({ text: "Please enter Parent PIN (1234):" }), oInput],
                beginButton: new Button({
                    text: "Login",
                    type: "Emphasized",
                    press: function () {
                        if (oInput.getValue() === "1234") {
                            oView.getModel("family").setProperty("/isAdmin", true);
                            oDialog.close();
                            oView.getController().getOwnerComponent().getRouter().navTo("adminRoute");
                        } else {
                            MessageToast.show("Wrong PIN!");
                            oInput.setValue("");
                        }
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () { oDialog.close(); }
                }),
                afterClose: function() { oDialog.destroy(); }
            });
            oDialog.open();
        },

        /* =========================================================== */
        /* DASHBOARD LOGIC                                             */
        /* =========================================================== */

        onAddItem: function () {
            var oModel = this.getView().getModel("family");
            var aShop = oModel.getProperty("/shopping") || [];
            var sNewItem = this.byId("addItemInput").getValue();

            if (sNewItem) {
                aShop.push({ item: sNewItem, bought: false });
                oModel.setProperty("/shopping", aShop);
                this.byId("addItemInput").setValue("");
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

        onOpenChores: function () {
            this.getOwnerComponent().getRouter().navTo("choresRoute");
        },

        _updateProgress: function () {
            var oProgress = this.byId("familyProgress");
            if (oProgress) {
                var aItems = this.getOwnerComponent().getModel("chores").getProperty("/items") || [];
                var iLeft = aItems.length;
                oProgress.setDisplayValue(iLeft + " tasks remaining");
                oProgress.setPercentValue(iLeft === 0 ? 100 : 50);
            }
        }
    });
});