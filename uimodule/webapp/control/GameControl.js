sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/m/Button"
], function (Control, VBox, Title, Button) {
	"use strict"

	return Control.extend("flying.money.game.control.GameControl", {

		metadata: {
			properties: {}
		},

		renderer: function (oRm, oControl) {
			oRm.openStart("div", oControl)
			oRm.openEnd()
			oRm.close("div")
		},

		onAfterRendering: function () {
			const oView = this.getParent().getParent().getParent()
			const oComponent = oView.getParent().getParent().getParent().getParent().getParent()
			const i18nModel = oComponent.getModel("i18n")

			const startButton = oView.byId("start-button")
			startButton.attachPress(this.startGame)

			// const resetButton = oView.byId("reset-button")
			// resetButton.attachPress(this.resetGame)

			const gameWrapper = document.createElement("div")
			gameWrapper.classList.add("game-wrapper")
			gameWrapper.id = "the-game-wrapper"
			this.getDomRef().appendChild(gameWrapper)

			const background = document.createElement("div")
			background.id = "the-background"
			background.classList.add("sapMIBar")
			background.classList.add("sapMHeader-CTX")
			gameWrapper.appendChild(background)

			const ball = document.createElement("img")
			ball.id = "the-ball"
			
			ball.src = oComponent.getModel("avatars").getData().selectedAvatar
			gameWrapper.appendChild(ball)

			const foreground = document.createElement("div")
			foreground.id = "the-foreground"
			gameWrapper.appendChild(foreground)

			new VBox({
				alignItems: "Center",
				items: [
					new Title(oView.createId("scoreStatus"), {
						titleStyle: "H5"
					}).addStyleClass("whiteText"),
					new Title(oView.createId("scoreTitle"), {
						titleStyle: "H5"
					}).addStyleClass("whiteText sapUiSmallMarginTop"),
					new Title(oView.createId("feedbackTitle"), {
						titleStyle: "H5"
					}).addStyleClass("whiteText sapUiSmallMarginTop"),
					new Button(oView.createId("reset-button"), {
						type: "Emphasized",
						text: i18nModel.getProperty("tryAgain"),
						icon: "sap-icon://redo",
						iconFirst: false
					}).addStyleClass("sapUiSmallMarginTop").attachPress(this.resetGame, this)
				]
			}).placeAt("the-foreground")

			oComponent.getModel("currentSession").setProperty("/score", 0)

			window.gameState = "Ready"
		},

		startGame: function () {
			let oView = this.getParent().getParent().getParent().getParent()
			if (oView.sId.indexOf("page") >= 0) {
				oView = this.getParent().getParent().getParent().getParent().getParent()
			}
			const oComponent = oView.getParent().getParent().getParent().getParent().getParent()
			const oModel = oComponent.getModel("currentSession")

			if (window.gameState !== "Ready") return
			window.gameState = "Play"

			const event = new Event("startGame")
			window.dispatchEvent(event)

			const moveSpeed = 3
			const gravity = 0.5
			const pipeGapY = 50
			const pipeGapX = 115

			const gameWrapper = document.getElementById("the-game-wrapper")

			const background = document.getElementById("the-background")
			const backgroundProps = background.getBoundingClientRect()
			const ball = document.getElementById("the-ball")
			let ballProps = ball.getBoundingClientRect()

			play()

			function play() {

				function move() {

					if (window.gameState !== "Play") return

					document.querySelectorAll(".pipe").forEach((element) => {
						const pipeProps = element.getBoundingClientRect()
						ballProps = ball.getBoundingClientRect()

						if (pipeProps.left + pipeProps.width <= 0) {
							element.remove()
						} else if (
							ballProps.left < pipeProps.left + pipeProps.width &&
							ballProps.left + ballProps.width > pipeProps.left &&
							ballProps.top < pipeProps.top + pipeProps.height &&
							ballProps.top + ballProps.height > pipeProps.top
						) {
							const event = new Event("endGame")
							window.dispatchEvent(event)
							window.gameState = "End"
							oModel.setProperty("/endGame", true)
							return
						} else if (
							pipeProps.right < ballProps.left &&
							pipeProps.right +
							moveSpeed >= ballProps.left &&
							element.increaseScore === "1"
						) {
							const oldScore = parseInt(oModel.getProperty("/score"))
							oModel.setProperty("/score", oldScore + 1)
						}
						element.style.left = `${pipeProps.left - backgroundProps.left - moveSpeed}px`
					})
					requestAnimationFrame(move)
				}
				requestAnimationFrame(move)
			}

			let ballDY = 0
			document.addEventListener("click", () => {
				ballDY = -7.6
			})
			document.addEventListener("keypress", () => {
				ballDY = -7.6
			})

			function applyGravity() {
				if (window.gameState !== "Play") return
				ballDY = ballDY + gravity

				if (
					ballProps.top <= backgroundProps.top ||
					ballProps.bottom >= backgroundProps.bottom
				) {
					const event = new Event("endGame")
					window.dispatchEvent(event)
					window.gameState = "End"
					oModel.setProperty("/endGame", true)
					return
				}
				ball.style.top = `${(ballProps.top - backgroundProps.top) + ballDY}px`
				ballProps = ball.getBoundingClientRect()
				requestAnimationFrame(applyGravity)
			}
			requestAnimationFrame(applyGravity)

			let currentPipeGapX = pipeGapX
			function createPipe() {
				if (window.gameState !== "Play") return

				if (currentPipeGapX >= pipeGapX) {
					currentPipeGapX = 0

					const pipePosition = Math.floor(Math.random() * 43) + 8
					const pipeTop = document.createElement("div")
					pipeTop.classList.add("pipe")
					pipeTop.style.top = `${pipePosition - 70}%`
					gameWrapper.appendChild(pipeTop)

					const pipeBottom = document.createElement("div")
					pipeBottom.classList.add("pipe")
					pipeBottom.style.top = `${pipePosition + pipeGapY}%`
					pipeBottom.increaseScore = "1"
					gameWrapper.appendChild(pipeBottom)
				}
				currentPipeGapX++
				requestAnimationFrame(createPipe)
			}
			requestAnimationFrame(createPipe)
		},

		resetGame: function () {
			const oComponent = this.getParent().getParent().getParent().getParent().getParent().getParent().getParent().getParent()

			if (window.gameState !== "End") return
			window.gameState = "Ready"

			oComponent.getModel("currentSession").setProperty("/score", 0)
			oComponent.getModel("currentSession").setProperty("/endGame", false)

			const ball = document.getElementById("the-ball")
			ball.style.top = "calc(50% - 20px)"

			document.querySelectorAll(".pipe").forEach((element) => {
				element.remove()
			})

			document.querySelector("#the-foreground").style.display = "none"
		},

	})

})