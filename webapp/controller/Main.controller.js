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
                points: { Tina: 100, Anopa: 50, Anotida: 50 },
                shopping: [{ item: "Milk", bought: false }],
                rewards: [
                    { title: "Extra Screen Time", cost: 50, icon: "sap-icon://display" },
                    { title: "Pizza Night Selection", cost: 100, icon: "sap-icon://pizza" }
                ],
                history: []
            };
            this.getView().setModel(new JSONModel(oData), "family");

            var oChoresModel = this.getOwnerComponent().getModel("chores");
            if (oChoresModel) {
                oChoresModel.dataLoaded ? oChoresModel.dataLoaded().then(this._updateProgress.bind(this)) : this._updateProgress();
            }
        },

        onTabSelect: function (oEvent) {
            if (oEvent.getParameter("key") === "admin" && !this.getView().getModel("family").getProperty("/isAdmin")) {
                this._showLoginDialog();
            }
        },

        _showLoginDialog: function () {
            var that = this;
            var oInput = new Input({ type: "Password", placeholder: "Enter PIN", textAlign: "Center" });
            var oDialog = new Dialog({
                title: "Parental Gate",
                type: "Message",
                content: [new Text({ text: "Please enter Parent PIN:" }), oInput],
                beginButton: new Button({
                    text: "Login",
                    press: function () {
                        if (oInput.getValue() === "1991") {
                            that.getView().getModel("family").setProperty("/isAdmin", true);
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
                        that.byId("idIconTabBar").setSelectedKey("shopping");
                    }
                })
            });
            oDialog.open();
        },

        onCompleteChore: function (oEvent) {
            var oFamilyModel = this.getView().getModel("family");
            var oChoresModel = this.getView().getModel("chores");
            var sPath = oEvent.getSource().getBindingContext("chores").getPath();
            var oChore = oChoresModel.getProperty(sPath);

            var iCurrent = oFamilyModel.getProperty("/points/" + oChore.assignedTo);
            oFamilyModel.setProperty("/points/" + oChore.assignedTo, iCurrent + parseInt(oChore.points));
            
            this._addHistory(oChore.assignedTo + " completed: " + oChore.taskName);
            this.onDeleteChore(oEvent);
        },

        onCreateChore: function () {
            var oModel = this.getView().getModel("chores");
            var aItems = oModel.getProperty("/items") || [];
            aItems.push({
                taskName: this.byId("inputNewChore").getValue(),
                assignedTo: this.byId("selectAssignee").getSelectedKey(),
                points: this.byId("stepPoints").getValue(),
                completed: false
            });
            oModel.setProperty("/items", aItems);
            this.byId("inputNewChore").setValue("");
            this._updateProgress();
        },

        onDeleteChore: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("chores").getPath();
            var aItems = this.getView().getModel("chores").getProperty("/items");
            aItems.splice(parseInt(sPath.split("/").pop()), 1);
            this.getView().getModel("chores").setProperty("/items", aItems);
            this._updateProgress();
        },

        onRedeemReward: function (oEvent) {
            var oModel = this.getView().getModel("family");
            var oReward = oEvent.getSource().getBindingContext("family").getObject();
            MessageBox.show("Who is redeeming?", {
                actions: ["Tina", "Anopa", "Anotida", "Cancel"],
                onClose: function (sAction) {
                    if (sAction === "Cancel" || !sAction) return;
                    var iPoints = oModel.getProperty("/points/" + sAction);
                    if (iPoints >= oReward.cost) {
                        oModel.setProperty("/points/" + sAction, iPoints - oReward.cost);
                        MessageToast.show("Success!");
                    } else {
                        MessageBox.error("Not enough points!");
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
                        MessageToast.show("Reset Successful!");
                    }
                }
            });
        },

        _updateProgress: function () {
            var aItems = this.getView().getModel("chores").getProperty("/items") || [];
            var iPerc = aItems.length === 0 ? 100 : 0;
            this.byId("familyProgress").setPercentValue(iPerc);
            this.byId("familyProgress").setDisplayValue(iPerc === 100 ? "All Done!" : "Tasks Pending");
        },

        _addHistory: function (sText) {
            var aHist = this.getView().getModel("family").getProperty("/history");
            aHist.unshift({ text: sText, time: new Date().toLocaleTimeString() });
            this.getView().getModel("family").setProperty("/history", aHist);
        },

        onAddItem: function () {
            var aShop = this.getView().getModel("family").getProperty("/shopping");
            aShop.push({ item: this.byId("addItemInput").getValue(), bought: false });
            this.getView().getModel("family").setProperty("/shopping", aShop);
            this.byId("addItemInput").setValue("");
        }
    });
});