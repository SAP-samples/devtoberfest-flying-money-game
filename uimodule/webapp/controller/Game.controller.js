sap.ui.define([
    "./BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict"

        return Controller.extend("flying.money.game.controller.Game", {
            onInit: function () {
                window.addEventListener("endGame", (e) => {                        
                        this._postScore()
                    })
                window.addEventListener("startGame", (e) => {
                    this._clearScoreStatus()
                })
            },
            _clearScoreStatus: function () {
                const oView = this.getView()
                oView.byId("scoreStatus").setText("")
            },
            _postScore: async function() {
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
                    const userID = firebase.auth().currentUser.uid
                    const score = parseInt(oView.byId("score").getText())
                    
                    let collectionRef = this._getScoreCollection(false, userID) // not sorted, with user condition
                    const snapshot = await collectionRef.get()
                    const userScores = snapshot.docs.map(doc => {
                        return doc.data()
                    })

                    const { serverTimestamp } = firebase.firestore.FieldValue
                    const body = {
                        userID: userID,
                        userNickname: window.localStorage.getItem("nickname"),
                        score: score,
                        timestamp: serverTimestamp()
                    }
                    
                    if (userScores.length == 0) {
                        oView.byId("scoreStatus").setText(i18nModel.getProperty("scorePosted"))
                        collectionRef = this._getScoreCollection(false) // not sorted
                        collectionRef.add(body)
                    } else if (score > userScores[0].score) {
                        oView.byId("scoreStatus").setText(i18nModel.getProperty("scorePosted"))
                        snapshot.docs.map(doc => doc.ref.update(body))
                    } else {
                        oView.byId("scoreStatus").setText(i18nModel.getProperty("noHighscore"))
                    }
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