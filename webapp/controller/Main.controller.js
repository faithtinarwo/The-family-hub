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
            var oData = {
                isAdmin: false,
                points: { Tina: 100, Anopa: 50, Anotida: 20 },
                shopping: [],
                leaderboard: [] 
            };

            var sSaved = localStorage.getItem("familyData");
            if (sSaved) {
                Object.assign(oData, JSON.parse(sSaved));
            }

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "family");

            this._refreshLeaderboard();
            
            oModel.attachPropertyChange(function(oEvent) {
                if (oEvent.getParameter("path").includes("points")) {
                    this._refreshLeaderboard();
                }
            }.bind(this));
        },

        /* =========================================================== */
        /* TILE NAVIGATION                                             */
        /* =========================================================== */

        onOpenChores: function () {
            this.getOwnerComponent().getRouter().navTo("choresRoute");
        },

        onOpenShopping: function () {
            var oPanel = this.byId("shoppingPanel");
            if (oPanel) {
                oPanel.setExpanded(true);
                oPanel.getDomRef().scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },

        onOpenAdmin: function () {
            // Check if already authenticated
            var oModel = this.getView().getModel("family");
            if (oModel.getProperty("/isAdmin")) {
                this.getOwnerComponent().getRouter().navTo("adminRoute");
            } else {
                this._showLoginDialog();
            }
        },

        /* =========================================================== */
        /* SHOPPING LOGIC                                              */
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
                aShop.push({ item: sNewItem });
                oModel.setProperty("/shopping", aShop);
                oInput.setValue("");
                localStorage.setItem("familyData", JSON.stringify(oModel.getData()));
            }
        },

        onDeleteItem: function (oEvent) {
            var oModel = this.getView().getModel("family");
            var sPath = oEvent.getSource().getBindingContext("family").getPath();
            var iIndex = parseInt(sPath.split("/").pop());
            var aShop = oModel.getProperty("/shopping");

            aShop.splice(iIndex, 1);
            oModel.setProperty("/shopping", aShop);
            localStorage.setItem("familyData", JSON.stringify(oModel.getData()));
        },

        /* =========================================================== */
        /* INTERNAL HELPERS                                            */
        /* =========================================================== */

        _refreshLeaderboard: function () {
            var oModel = this.getView().getModel("family");
            var oPoints = oModel.getProperty("/points");

            var aScores = Object.keys(oPoints).map(function(key) {
                return {
                    name: key,
                    points: oPoints[key],
                    color: key === "Tina" ? "Accent1" : (key === "Anopa" ? "Accent2" : "Accent3")
                };
            });

            aScores.sort((a, b) => b.points - a.points);
            var aPodiumOrder = [aScores[1], aScores[0], aScores[2]];
            oModel.setProperty("/leaderboard", aPodiumOrder);
        },

        _showLoginDialog: function () {
            var oView = this.getView();
            var oController = this;
            
            var oDialog = new Dialog({
                title: "Parental Access",
                type: "Message",
                content: [
                    new Text({ text: "Enter Parent PIN to continue:" }),
                    new Input({
                        id: "pinInput",
                        type: "Password",
                        placeholder: "1234",
                        liveChange: function(oEvent) {
                            var sVal = oEvent.getParameter("value");
                            if (sVal === "1234") {
                                oView.getModel("family").setProperty("/isAdmin", true);
                                oDialog.close();
                                oController.getOwnerComponent().getRouter().navTo("adminRoute");
                            }
                        }
                    })
                ],
                beginButton: new Button({
                    text: "Cancel",
                    press: function () { oDialog.close(); }
                }),
                afterClose: function() { oDialog.destroy(); }
            });

            oDialog.open();
        }
    });
});