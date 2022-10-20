sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button",
    'sap/ui/core/Fragment',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Dialog, Text, Button, Fragment, Filter, FilterOperator) {
    "use strict"

    return Controller.extend("flying.money.game.controller.Leaderboard", {
        onInit: async function() {
            const oComponent = this.getOwnerComponent()
            oComponent.setModel(new JSONModel({
                avatars: [
                    {
                        name: "💸",
                        pic: "money_with_wings.png"
                    },
                    {
                        name: "🤑",
                        pic: "money_mouth_face.png"
                    }
                ],
                selectedAvatar: "money_with_wings.png"
            }), "avatars")

            oComponent.setModel(new JSONModel({}), "currentSession")
            const oModel = oComponent.getModel("currentSession")

            const oView = this.getView()
            const nickname = window.localStorage.getItem("nickname")    
            if (nickname && nickname.length >= 1) {
                oView.byId("nickname").setValue(nickname)
                oModel.setProperty("/nickname", nickname)
                oModel.setProperty("/nicknameSet", true)
            } else {
                oModel.setProperty("/nicknameSet", false)
            }
            
            const that = this
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    oModel.setProperty("/userID", user.uid)
                    that._listenForTournaments()
                    const userCollectionRef = that._getUserCollection()
                    userCollectionRef.onSnapshot(querySnapshot => {                        
                        let users = querySnapshot.docs.map(document => {
                            return document.data()
                        })
                        const oUsers = {
                            users: users
                        }
                        that.getOwnerComponent().setModel(new JSONModel(oUsers), "users")
                    })

                    const scoreCollectionRef = that._getScoreCollection(true) // sorted
                    scoreCollectionRef.onSnapshot(querySnapshot => {                        
                        let scores = querySnapshot.docs.map(document => {
                            return document.data()
                        })
                        if (scores.length >= 3) {
                            scores[0].userNickname = scores[0].userNickname + " 🥇"
                            scores[1].userNickname = scores[1].userNickname + " 🥈"
                            scores[2].userNickname = scores[2].userNickname + " 🥉"
                        }
                        const oScores = {
                            scores: scores
                        }
                        that.getOwnerComponent().setModel(new JSONModel(oScores), "scores")
                    })
                }
            })
        },
        _listenForTournaments: function() {
            const collectionRef = this._getTournamentCollection()
            const that = this
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    collectionRef.onSnapshot(querySnapshot => { 

                        // set tournaments model with backend data                       
                        let tournaments = querySnapshot.docs.map(document => {
                            let data = document.data()
                            data.id = document.id
                            return data
                        })
                        const oTournaments = {
                            tournaments: tournaments
                        }
                        const oComponent = that.getOwnerComponent()
                        oComponent.setModel(new JSONModel(oTournaments), "tournaments")
                        const oModel = oComponent.getModel("tournaments")

                        // check if user registered and tournament exists
                        const nickname = window.localStorage.getItem("nickname")
                        if (nickname && tournaments[0]) {
                            // check if tournament is ready
                            if (tournaments[0].active) {
                                oModel.setProperty("/tournaments/0/tournamentIsReady", true)
                                that._openDialogTournamentStatusChange()
                            }
                            
                            // reset if tournament ended
                            else {
                                oModel.setProperty("/tournaments/0/tournamentIsReady", false)
                                that._openDialogTournamentStatusChange()
                            }
                        } else {
                            oModel.setProperty("/tournaments/0/tournamentIsReady", false),
                            that._closeTournamentDialog()
                        }
                        
                    })
                }
            })
        },
        submitNickname: function(oEvent) {
            const oView = this.getView()
            const oModel = oView.getModel("currentSession")
            const nickname = oView.byId("nickname").getValue()

            if (nickname && nickname.length >= 1) {
                window.localStorage.setItem("nickname", nickname)
                oModel.setProperty("/nickname", nickname)
                oModel.setProperty("/nicknameSet", true)
            } else {
                oModel.setProperty("/nicknameSet", false)
            }
            const collectionRef = this._getUserCollection()
            collectionRef.add({
                nickname: window.localStorage.getItem("nickname"),
                userID: oModel.getProperty("/userID")
            })

            this._listenForTournaments()
        },
        editNickname: function() {
            const oView = this.getView()
            const oModel = oView.getModel("currentSession")

            window.localStorage.setItem("nickname", "")
            oModel.setProperty("/nicknameSet", false)

            oView.byId("submitNickname").setText("")
            oView.byId("submitNickname").setIcon("sap-icon://save")

            this._listenForTournaments()
        },
        startGame: async function(oEvent) {
            const oComponent = this.getOwnerComponent()
            const tournamentModel = oComponent.getModel("tournaments")
            const tournamentIsReady = tournamentModel.getProperty("/tournaments/0/tournamentIsReady")

            if (!tournamentIsReady || oEvent && oEvent.getSource().sId.indexOf("startGame") == -1) {
                this.getRouter().navTo("Game", { layout: "OneColumn",  mode: "Practice" })
                this.getRouter().navTo("Game", { layout: "TwoColumnsMidExpanded", mode: "Practice" })
            } else {
                this.getRouter().navTo("Game", { layout: "OneColumn",  mode: "Tournament" })
                this.getRouter().navTo("Game", { layout: "TwoColumnsMidExpanded", mode: "Tournament" })
            }

            const mode = window.location.href.split("/").reverse()[0]
            let oModel = oComponent.getModel("mode")
            if (!oModel) {
                oComponent.setModel(new JSONModel({}), "mode")
                oModel = oComponent.getModel("mode")
            }
            oModel.setProperty("/mode", mode)
            oModel.setProperty("/isPractice", mode != "Tournament")
            oModel.setProperty("/isTournament", mode == "Tournament")
        },
        onSearch: function (oEvent) {
            let aFilter = []
            const sQuery = oEvent.getParameter("newValue")
            if (sQuery) {
                aFilter.push(new Filter("userNickname", FilterOperator.Contains, sQuery))
            }
            const oList = this.byId("leaderboardList")
            let oBinding = oList.getBinding("items")
            oBinding.filter(aFilter)
        },
        onSelectAvatar: function (oEvent) {
            document.querySelector("#the-ball").src = oEvent.getSource().getSelectedKey()
        },
        openAdmin: function () {
            this.getRouter().navTo("Admin", { layout: "OneColumn" })
            this.getRouter().navTo("Admin", { layout: "TwoColumnsMidExpanded" })
        },
        _openDialogTournamentStatusChange: function () {
            this._closeTournamentDialog()
            const oComponent = this.getOwnerComponent()
            const i18nModel = oComponent.getModel("i18n")
            const tournamentModel = oComponent.getModel("tournaments")
            const tournamentIsReady = tournamentModel.getProperty("/tournaments/0/tournamentIsReady")
            let dialogText, buttonText
            let icon = "sap-icon://competitor"
            if (tournamentIsReady) {
                dialogText =  i18nModel.getProperty("tournamentReady"),
                buttonText = i18nModel.getProperty("startGame")
            } else {
                icon = ""
                const scoresModel = oComponent.getModel("scores")
                const dialogText1 =  i18nModel.getProperty("tournamentEnded")
                const scores = scoresModel.getProperty("/scores")
                if (scores.length >= 3) {
                    const dialogText2 = `${scores[0].userNickname} (${scores[0].score} ${i18nModel.getProperty("points")})`
                    const dialogText3 = `${scores[1].userNickname} (${scores[1].score} ${i18nModel.getProperty("points")})`
                    const dialogText4 = `${scores[2].userNickname} (${scores[2].score} ${i18nModel.getProperty("points")})`
                    dialogText = dialogText1 + "\n\n" + dialogText2 + "\n" + dialogText3 + "\n" + dialogText4
                } else {
                    dialogText = dialogText1
                }
                buttonText = i18nModel.getProperty("practiceGame")
            }
            
            this.oDialog = new Dialog({
                showHeader: false,
                content: new Text({
                    text: dialogText
                }),
                buttons: new Button({
                    text: buttonText,
                    type: "Emphasized",
                    icon: icon,
                    iconFirst: false,
                    press: function () {
                        this.oDialog.close();
                        this.startGame()
                    }.bind(this)
                })
            }).addStyleClass("sapUiContentPadding")

            //to get access to the controller's model
            this.getView().addDependent(this.oDialog);

			this.oDialog.open();
        },
        _closeTournamentDialog: function () {
            if (this.oDialog) {
                this.oDialog.close()
            }
        },
        handlePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "flying.money.game.view.Popover",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then(function(oPopover) {
				oPopover.openBy(oButton);
			});
		},
        handleCloseButton: function (oEvent) {
			this.byId("aboutPopover").close();
		}
    })
})
