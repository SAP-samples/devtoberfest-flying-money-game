sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"./BaseController",
], function (JSONModel, Controller) {
	"use strict"

	return Controller.extend("flying.money.game.controller.FlexibleColumnLayout", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter()
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this)
		},

		onBeforeRouteMatched: function(oEvent) {

			var oModel = this.getOwnerComponent().getModel()

			var sLayout = oEvent.getParameters().arguments.layout

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0)
				sLayout = oNextUIState.layout
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout)
			}
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout")

			this._updateUIElements()

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: sLayout, product: this.currentProduct, supplier: this.currentSupplier}, true)
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel()
			var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState()
			oModel.setData(oUIState)
		},

		onExit: function () {
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this)
		}
	})
})
