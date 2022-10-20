sap.ui.define([
    "./BaseController",
	"sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast) {
        "use strict"

        return Controller.extend("flying.money.game.controller.Game", {
            onInit: function () {
                window.addEventListener("endGame", (e) => {                        
                        this._postScore()
                    })
            },
            _postScore: function() {
                const oView = this.getView()
                const oComponent = this.getOwnerComponent()

                const score = oComponent.getModel("currentSession").getProperty("/score")
                const i18nModel = oComponent.getModel("i18n")
                let feedbackText
                if (score <= 3) {
                    feedbackText = i18nModel.getProperty("level1")
                } else if (score > 3 && score <= 15) {
                    feedbackText = i18nModel.getProperty("level2")
                } else {
                    feedbackText = i18nModel.getProperty("level3")
                }
                oView.byId("feedbackTitle").setText(feedbackText)
                oView.byId("scoreTitle").setText(`${score} ${i18nModel.getProperty("points")}`)
                document.querySelector("#the-foreground").style.display = "flex"

                const oModel = oComponent.getModel("mode")
                if (oModel.getProperty("/isTournament")) {
                    const firebase = this._getFirebase()
                    const collectionRef = this._getScoreCollection(false) // not sorted
                    const { serverTimestamp } = firebase.firestore.FieldValue
                    collectionRef.add({
                        userID: firebase.auth().currentUser.uid,
                        userNickname: window.localStorage.getItem("nickname"),
                        score: parseInt(oView.byId("score").getText()),
                        timestamp: serverTimestamp()
                    })
                    // MessageToast.show(i18nModel.getProperty("scorePosted"), {
                    //     of: oView,
                    //     offset: "0 -50",
                    //     duration: 3000
                    // })
                    oView.byId("scoreStatus").setText(i18nModel.getProperty("scorePosted"))
                } else {
                    oView.byId("scoreStatus").setText(i18nModel.getProperty("practice"))
                }          
            },
            handleNavBack: function () {
                this.getRouter().navTo("Leaderboard", { layout: "OneColumn" })
            }
        })
    }
)