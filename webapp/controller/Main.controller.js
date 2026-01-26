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
                rewards: [
                    { title: "Extra Screen Time", cost: 50, icon: "sap-icon://display" },
                    { title: "Pizza Night Selection", cost: 100, icon: "sap-icon://pizza" }
                ],
                history: []
            };
            this.getView().setModel(new JSONModel(oData), "family");

            // 2. Safely initialize the 'chores' model from manifest
            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oChoresModel) {
                // If the model is already loading data, wait for it
                if (oChoresModel.dataLoaded) {
                    oChoresModel.dataLoaded().then(this._updateProgress.bind(this));
                } else {
                    this._updateProgress();
                }
            }
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oFamilyModel = this.getView().getModel("family");
            
            if (sKey === "admin" && !oFamilyModel.getProperty("/isAdmin")) {
                this._showLoginDialog();
            }
        },

        _showLoginDialog: function () {
            var oView = this.getView();
            var oInput = new Input({ type: "Password", placeholder: "Enter PIN", textAlign: "Center" });
            
            var oDialog = new Dialog({
                title: "Parental Gate",
                type: "Message",
                content: [new Text({ text: "Please enter Parent PIN:" }), oInput],
                beginButton: new Button({
                    text: "Login",
                    press: function () {
                        if (oInput.getValue() === "1234") {
                            oView.getModel("family").setProperty("/isAdmin", true);
                            oDialog.close();
                        } else {
                            MessageToast.show("Wrong PIN!");
                        }
                    }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                        // Reset tab to Shopping if cancelled
                        oView.byId("idIconTabBar").setSelectedKey("shopping");
                    }
                })
            });
            oDialog.open();
        },

        onCompleteChore: function (oEvent) {
            var oFamilyModel = this.getView().getModel("family");
            var oChoresModel = this.getView().getModel("chores");
            var oContext = oEvent.getSource().getBindingContext("chores");
            
            if (!oContext) return;

            var oChore = oContext.getObject();
            var sUser = oChore.assignedTo;
            var iPointsEarned = parseInt(oChore.points);

            // Update user points
            var iCurrentPoints = oFamilyModel.getProperty("/points/" + sUser) || 0;
            oFamilyModel.setProperty("/points/" + sUser, iCurrentPoints + iPointsEarned);
            
            this._addHistory(sUser + " completed: " + oChore.taskName);
            this.onDeleteChore(oEvent);
            
            MessageToast.show("Points added to " + sUser + "!");
        },

        onCreateChore: function () {
            var oModel = this.getView().getModel("chores");
            var aItems = oModel.getProperty("/items") || [];
            
            var sTask = this.byId("inputNewChore").getValue();
            if (!sTask) {
                MessageToast.show("Please enter a task name");
                return;
            }

            aItems.push({
                taskName: sTask,
                assignedTo: this.byId("selectAssignee").getSelectedKey(),
                points: this.byId("stepPoints").getValue(),
                completed: false
            });
            
            oModel.setProperty("/items", aItems);
            this.byId("inputNewChore").setValue("");
            this._updateProgress();
        },

        onDeleteChore: function (oEvent) {
            var oModel = this.getView().getModel("chores");
            var sPath = oEvent.getSource().getBindingContext("chores").getPath();
            var aItems = oModel.getProperty("/items");
            
            // Extract index from path (e.g., "/items/2" -> 2)
            var iIndex = parseInt(sPath.split("/").pop());
            aItems.splice(iIndex, 1);
            
            oModel.setProperty("/items", aItems);
            this._updateProgress();
        },

        onRedeemReward: function (oEvent) {
            var oModel = this.getView().getModel("family");
            var oReward = oEvent.getSource().getBindingContext("family").getObject();
            
            MessageBox.show("Who is redeeming " + oReward.title + "?", {
                actions: ["Tina", "Anopa", "Anotida", "Cancel"],
                onClose: function (sAction) {
                    if (sAction === "Cancel" || !sAction) return;
                    
                    var iPoints = oModel.getProperty("/points/" + sAction);
                    if (iPoints >= oReward.cost) {
                        oModel.setProperty("/points/" + sAction, iPoints - oReward.cost);
                        MessageToast.show("Enjoy your reward, " + sAction + "!");
                    } else {
                        MessageBox.error("Not enough points! Keep working hard!");
                    }
                }
            });
        },

        onResetWeeklyPoints: function () {
            var oModel = this.getView().getModel("family");
            MessageBox.confirm("Reset everything for the new week?", {
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        oModel.setProperty("/points", { Tina: 0, Anopa: 0, Anotida: 0 });
                        oModel.setProperty("/history", []);
                        MessageToast.show("Fresh start for everyone!");
                    }
                }
            });
        },

        _updateProgress: function () {
            var oModel = this.getView().getModel("chores");
            if (!oModel) return;

            var aItems = oModel.getProperty("/items") || [];
            var iPerc = aItems.length === 0 ? 100 : 0;
            
            var oProgress = this.byId("familyProgress");
            if (oProgress) {
                oProgress.setPercentValue(iPerc);
                oProgress.setDisplayValue(iPerc === 100 ? "Goal Met!" : "Pending Tasks");
            }
        },

        _addHistory: function (sText) {
            var oModel = this.getView().getModel("family");
            var aHist = oModel.getProperty("/history") || [];
            
            aHist.unshift({ 
                text: sText, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            });
            oModel.setProperty("/history", aHist);
        },

        onAddItem: function () {
            var oModel = this.getView().getModel("family");
            var aShop = oModel.getProperty("/shopping") || [];
            var sNewItem = this.byId("addItemInput").getValue();

            if (sNewItem) {
                aShop.push({ item: sNewItem, bought: false });
                oModel.setProperty("/shopping", aShop);
                this.byId("addItemInput").setValue("");
            }
        }
    });
});