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
            // 1. Initialize the local 'family' model
            var oData = {
                isAdmin: false,
                points: { Tina: 100, Anopa: 50, Anotida: 50 },
                shopping: [{ item: "Milk", bought: false }],
                history: []
            };
            this.getView().setModel(new JSONModel(oData), "family");

            // 2. Initialize the 'chores' model from manifest
            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oChoresModel) {
                oChoresModel.attachRequestCompleted(function() {
                    this._updateProgress();
                }.bind(this));
            }
        },

        /* =========================================================== */
        /* SECURITY: THE PARENTAL GATE                                 */
        /* =========================================================== */

        onOpenAdmin: function () {
            var oFamilyModel = this.getView().getModel("family");
            
            // If already logged in, go straight there
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
                textAlign: "Center",
                submit: function() { oDialog.getBeginButton().firePress(); }
            });
            
            var oDialog = new Dialog({
                title: "Parental Gate",
                type: "Message",
                content: [new Text({ text: "Please enter Parent PIN to access Management:" }), oInput],
                beginButton: new Button({
                    text: "Login",
                    type: "Emphasized",
                    press: function () {
                        if (oInput.getValue() === "1234") { // Your Secret PIN
                            oView.getModel("family").setProperty("/isAdmin", true);
                            oDialog.close();
                            oView.getController().getOwnerComponent().getRouter().navTo("adminRoute");
                        } else {
                            MessageToast.show("Wrong PIN! Access Denied.");
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

        onOpenChores: function () {
            this.getOwnerComponent().getRouter().navTo("choresRoute");
        },

        onAddItem: function () {
            var oModel = this.getView().getModel("family");
            var aShop = oModel.getProperty("/shopping") || [];
            var sNewItem = this.byId("addItemInput").getValue();

            if (sNewItem) {
                aShop.push({ item: sNewItem, bought: false });
                oModel.setProperty("/shopping", aShop);
                this.byId("addItemInput").setValue("");
                MessageToast.show("Added to list");
            }
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