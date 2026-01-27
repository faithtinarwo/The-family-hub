sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("family.dash.controller.Main", {

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // 1. prepare user model
            const oUser = {
                name: "Alex (Kid)",
                role: "Kid"               // <-- "Parent" | "Kid"
            };
            this.getView().setModel(new JSONModel(oUser), "user");

            // 2. decide visibility only for the Parent role
            this._toggleBudgetTile(oUser.role === "Parent");
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        onOpenChores: function () {
            this.getOwnerComponent().getRouter().navTo("choresRoute");
        },

        /* =========================================================== */
        /* internal helpers                                            */
        /* =========================================================== */

        /**
         * Shows the budget tile only when the user is a parent.
         * @param {boolean} bVisible target visibility
         */
        _toggleBudgetTile: function (bVisible) {
            const oTile = this.byId("budgetTile");
            // defensive: do not crash if somebody deletes the control
            if (oTile) {
                oTile.setVisible(bVisible);
            } else {
                // remove when everything is stable
                // eslint-disable-next-line no-console
                console.warn("Main.controller: no control with ID 'budgetTile' found");
            }
        }
    });
});