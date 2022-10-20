sap.ui.define([
    "./BaseController"
], function (Controller) {
    "use strict"

    return Controller.extend("flying.money.game.controller.Admin", {
        handleNavBack: function () {
            this.getRouter().navTo("Leaderboard", { layout: "OneColumn" })
        }
    })
})
