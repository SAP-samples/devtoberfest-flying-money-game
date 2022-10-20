sap.ui.define([
    "sap/base/util/UriParameters",
	"sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
        "./Firebase"
    ],
    function (UriParameters, UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper, Firebase) {
        "use strict";

        const LayoutType = library.LayoutType;

        return UIComponent.extend("flying.money.game.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                UIComponent.prototype.init.apply(this, arguments);

                var oModel = new JSONModel();
			    this.setModel(oModel);

                this.getRouter().initialize();

                this.setModel(Firebase.initializeFirebase(), "firebase");

                const mFirebase = this.getModel("firebase")
                const firebase = mFirebase.getData()
                
                firebase.auth().signInAnonymously().catch(function (error) {
                    console.log(error)
                })                
            },
            getHelper: function () {
                const oFCL = this.getRootControl().byId("fcl"),
                    oParams = UriParameters.fromQuery(location.search),
                    oSettings = {
                        defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                        defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
                        mode: oParams.get("mode"),
                        maxColumnsCount: oParams.get("max")
                    };
    
                return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
            }
        });
    }
);