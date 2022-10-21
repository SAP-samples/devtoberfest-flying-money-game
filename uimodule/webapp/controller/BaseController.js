sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.ui.core.UIComponent} UIComponent
     */
    function (Controller, History, UIComponent) {
        "use strict"

        return Controller.extend("flying.money.game.controller.BaseController", {
            /**
             * Convenience method for getting the view model by name in every controller of the application.
             * @public
             * @param {string} sName the model name
             * @returns {sap.ui.model.Model} the model instance
             */
            getModel: function (sName) {
                return this.getView().getModel(sName)
            },

            /**
             * Convenience method for setting the view model in every controller of the application.
             * @public
             * @param {sap.ui.model.Model} oModel the model instance
             * @param {string} sName the model name
             * @returns {sap.ui.core.mvc.View} the view instance
             */
            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName)
            },

            /**
             * Convenience method for getting the resource bundle.
             * @public
             * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
             */
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle()
            },

            /**
             * Method for navigation to specific view
             * @public
             * @param {string} psTarget Parameter containing the string for the target navigation
             * @param {Object.<string, string>} pmParameters? Parameters for navigation
             * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
             */
            navTo: function (psTarget, pmParameters, pbReplace) {
                this.getRouter().navTo(psTarget, pmParameters, pbReplace)
            },

            getRouter: function () {
                return UIComponent.getRouterFor(this)
            },

            onNavBack: function () {
                const sPreviousHash = History.getInstance().getPreviousHash()

                if (sPreviousHash !== undefined) {
                    window.history.back()
                } else {
                    this.getRouter().navTo("appHome", {}, true /* no history*/)
                }
            },
            _getUserCollection: function () {
                const mFirebase = this.getOwnerComponent().getModel("firebase")
                const firebase = mFirebase.getData()
                const db = firebase.firestore()
                const collectionRef = db.collection("users")
                return collectionRef
            },
            _getScoreCollection: function(sorted, userID) {
                const mFirebase = this.getOwnerComponent().getModel("firebase")
                const firebase = mFirebase.getData()
                const db = firebase.firestore()
                let collectionRef
                if (sorted) {
                    collectionRef = db.collection("scores").orderBy("score", "desc")
                } else if (userID) {
                    collectionRef = db.collection("scores").where("userID", "==", userID)
                } else {
                    collectionRef = db.collection("scores")
                }
                
                return collectionRef
            },
            _getTournamentCollection: function() {
                const mFirebase = this.getOwnerComponent().getModel("firebase")
                const firebase = mFirebase.getData()
                const db = firebase.firestore()
                let collectionRef
                    collectionRef = db.collection("tournaments")
                return collectionRef
            },
            _updateTournamentCollection: async function(body, userID) {
                const collectionRef = this._getTournamentCollection(userID)
                const snapshot = await collectionRef.get()
                snapshot.docs.map(doc => doc.ref.update(body))
            },
            _getFirebase: function() {
                const mFirebase = this.getOwnerComponent().getModel("firebase")
                const firebase = mFirebase.getData()
                return firebase
            }
        })
    }
)
