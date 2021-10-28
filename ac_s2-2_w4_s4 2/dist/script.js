const SPADES_ICON_SRC = 'https://image.flaticon.com/icons/svg/105/105223.svg'
const HEARTS_ICON_SRC = 'https://image.flaticon.com/icons/svg/105/105220.svg'
const DIAMONDS_ICON_SRC = 'https://image.flaticon.com/icons/svg/105/105212.svg'
const CLUBS_ICON_SRC = 'https://image.flaticon.com/icons/svg/105/105219.svg'
const CARD_SYMBOLS = [SPADES_ICON_SRC, HEARTS_ICON_SRC, DIAMONDS_ICON_SRC, CLUBS_ICON_SRC]
const CARD_AMOUNT = 52
const SCORE_PER_MATCH = 10
const MAX_SCORE = 260
const GAME_STATE = {
	0: 'FirstCardAwaits',
	1: 'SecondCardAwaits',
	2: 'CardMatchFailed',
	3: 'CardMatched',
	4: 'GameFinished'
}

const header = document.querySelector('.header')
const table = document.querySelector('.table')
const score = document.querySelector('.score')
const triedTimes = document.querySelector('.tried-times')

const utility = {
	autoPlay: undefined,
	tempCardId: [],
	cardMatched: [],
	cardKnown: [],
	getRandomNumberArray(count) {
		const number = Array.from(Array(count).keys())
		for (let i = number.length - 1; i > 0; i--) {
			let randIndex = Math.floor(Math.random() * (i + 1));
			[number[i], number[randIndex]] = [number[randIndex], number[i]]
		}
		
		return number
	},
	flipCardAuto() {
		let randCardId = -1
		do {
			randCardId = Math.floor(Math.random() * CARD_AMOUNT)
		} while(utility.cardMatched.includes(randCardId) || utility.tempCardId.includes(randCardId))
		controller.dipatchCardAction(table.children[randCardId])
		/*utility.tempCardId.push(randCardId)*/
	},
	isCardMatched(idFirst, idSecond) {
		return table.children[idFirst].dataset.id % 13 === table.children[idSecond].dataset.id % 13
	},
	moveIdfromKnownToMatched(...cardsId) {
		cardsId.map(id => {
			this.cardMatched.push(id)
			if (this.cardKnown.indexOf(id) >= 0) {
				this.cardKnown.splice(this.cardKnown.indexOf(id), 1)
			}
		})
	},
	addIdToKnown(...cardsId) {
		cardsId.map(id => {
			if (this.cardKnown.indexOf(id) < 0) {
				this.cardKnown.push(id)
			}
		})
	},
	getIdOfCard(...cards) {
		const cardId = []
		
		cards.map(card => {
			for (let i = 0; i < CARD_AMOUNT; i++) {
				if (table.children[i].dataset.id === card.dataset.id) {
					cardId.push(i)
					break
				}
			}
		})
		return cardId
	},
	activateAutoPlaying() {
		this.autoPlay = setInterval(() => {
			switch (controller.currentState) {
				case 0:
					console.log(`【Round：${model.currentTimes + 1}】`)
					console.log('Flip first card...')
					this.flipCardAuto()
					break
				case 1:
					// Select from the card known list.
					if (this.cardKnown.length > 0) {
						console.log('Select next card from the known list...')
						for (let i = 0; i < this.cardKnown.length; i++) {
							/*console.log(`Card ID: ${this.cardKnown[i]}`)*/
							if (this.cardKnown[i] !== this.tempCardId[0] && this.isCardMatched(this.cardKnown[i], this.tempCardId[0])) {
								console.log('Find matched!')
								controller.dipatchCardAction(table.children[this.cardKnown[i]]) //Flip card.
								/*this.moveIdfromKnownToMatched(this.cardKnown[i], this.tempCardId[0])*/
								this.tempCardId = [] //Clear the temp list.
								return
							}
						}
						console.log('No match...')
					}
					// Select with random ID.
					console.log('Flip second card...')
					this.flipCardAuto()
					if (this.isCardMatched(this.tempCardId[0], this.tempCardId[1])) {
						console.log('Find matched!')
						/*this.moveIdfromKnownToMatched(...this.tempCardId)*/
					} else {
						console.log('No match...')
						console.log('Record cards on the known list...')
						/*this.addIdToKnown(...this.tempCardId)*/
					}
					this.tempCardId = [] //Clear the temp list.
					break
				case 4:
					console.log('Game finished, end auto playing.')
					clearInterval(this.autoPlay)
					view.toggleAutoPlayingBtn()
			}
		}, 2000)
	},
	toggleAvailableAutoPlaying() {
		const btn = document.querySelector('#auto-play')
		if (btn.getAttribute('disabled') !== null) {
			btn.removeAttribute('disabled')
			return
		}
		btn.setAttribute('disabled', null)
	},
	resetAutoRecord() {
		utility.tempCardId = []
		utility.cardMatched = []
		utility.cardKnown = []
	}
}
const model = {
	revealedCards: [],
	currentScore: 0,
	currentTimes: 0,
	isRevealedCardsMatched() {
		return this.revealedCards[0].dataset.id % 13 === this.revealedCards[1].dataset.id % 13 
	}
}
const view = {
	displayCards(cardAmount) {
		let tempHTML = ''
		
		cardAmount.forEach(item => {
			tempHTML += `<div class="poker covered d-flex flex-column justify-content-around" data-id="${item}"></div>`
		})
		table.innerHTML = tempHTML
	},
	transformNumber(num) {
		switch (num) {
			case 1:
				return 'A'
			case 11:
				return 'J'
			case 12:
				return 'Q'
			case 13:
				return 'K'
			default:
				return num
		}
	},
	getCardContent(id) {
		const symbol = Math.floor(id / 13)
		const cardNum = this.transformNumber(id % 13 + 1)
		return `<p class="align-self-start m-0 ml-1">${cardNum}</p>
						<img src="${CARD_SYMBOLS[symbol]}" class="card-img-top align-self-center" style="width: 40%;" alt="...">
						<p class="align-self-end m-0 mr-1" style="transform: rotate(180deg);">${cardNum}</p>`
	},
	flipCards(...cards) {
		cards.map(card => {
			if (card.matches('.covered')) {
				card.classList.remove('covered')
				card.innerHTML = view.getCardContent(Number(card.dataset.id))
				return
			}
			card.classList.add('covered')
			card.innerHTML = null
		})
	},
	pairCards(...cards) {
		cards.map(card => {
			card.classList.add('paired')
		})
	},
	appendWrongAnimation(...cards) {
		cards.map(card => {
			card.classList.add('wrong')
			card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
	},
	appendRightAnimation(...cards) {
		cards.map(card => {
			card.classList.add('right')
			card.addEventListener('animationend', event => event.target.classList.remove('right'), { once: true })
    })
	},
	renderScore(num) {
		score.innerHTML = `Score：${num}`
	},
	renderTriedTimes(times) {
		triedTimes.innerHTML = `You've tried：${times} times`
	},
	showGameFinished() {
		const div = document.createElement('div')
		div.classList.add('completed', 'd-flex', 'flex-column', 'align-items-center')
		div.innerHTML = `
			<p>Complete!</p>
      <p>Score: ${model.currentScore}</p>
      <p>You've tried: ${model.currentTimes} times</p>
			<button type="button" class="btn btn-primary mt-2">Try Again</button>`
		
		div.addEventListener('click', () => {
			controller.setNewGame()
			div.remove()
		}, { once: true })
		
		header.before(div)
	},
	toggleAutoPlayingBtn() {
		const btn = document.querySelector('#auto-play')
		
		if (btn.matches('.activated')){
			btn.classList.remove('activated')
			btn.innerText = 'Auto Playing'
			return
		}
		btn.classList.add('activated')
		btn.innerText = 'Stop Auto'
	}
}
const controller = {
	currentState: 0,
	initializeGame() {
		view.renderScore(model.currentScore = 0)
		view.renderTriedTimes(model.currentTimes = 0)
		view.displayCards(utility.getRandomNumberArray(CARD_AMOUNT))
		/*view.displayCards(Array.from(Array(CARD_AMOUNT).keys()))*/
		
		// Auto playing button event.
		document.querySelector('#auto-play').addEventListener('click', event => {
			const target = event.target
			
			if (target.matches('.activated')){
				clearInterval(utility.autoPlay)
			} else {
				utility.activateAutoPlaying()
			}
			view.toggleAutoPlayingBtn()
		})
		
		// Card clicking event.
		table.addEventListener('click', event => {
			const target = event.target
	
			if (target.matches('.poker')) {
				controller.dipatchCardAction(target)
			}
		})
	},
	setNewGame() {
		controller.currentState = 0
		view.renderScore(model.currentScore = 0)
		view.renderTriedTimes(model.currentTimes = 0)
		view.displayCards(utility.getRandomNumberArray(CARD_AMOUNT))
		utility.toggleAvailableAutoPlaying() //Enable auto playing button.
		utility.resetAutoRecord() //Reset auto playing record.
	},
	dipatchCardAction(card) {
		if (!card.matches('.covered')) return
		view.flipCards(card)
		model.revealedCards.push(card)
		
		switch (this.currentState) {
			case 0:
				this.currentState = 1
				utility.tempCardId.push(...utility.getIdOfCard(model.revealedCards[0])) //Record for auto playing.
				break
			case 1:
				view.renderTriedTimes(++model.currentTimes)
				utility.tempCardId.push(...utility.getIdOfCard(model.revealedCards[1])) //Record for auto playing.
				
				if (model.isRevealedCardsMatched()) {
					view.renderScore(model.currentScore += SCORE_PER_MATCH)
					this.currentState = 3
					view.appendRightAnimation(...model.revealedCards)
					view.pairCards(...model.revealedCards)
					utility.moveIdfromKnownToMatched(...utility.getIdOfCard(...model.revealedCards)) //Record for auto playing.
					model.revealedCards = []
					
					if (model.currentScore === MAX_SCORE) {
            this.currentState = 4
            view.showGameFinished()
						utility.toggleAvailableAutoPlaying() //Disable auto playing button.
            return
					}
				} else {
					this.currentState = 2
					view.appendWrongAnimation(...model.revealedCards)
					utility.addIdToKnown(...utility.getIdOfCard(...model.revealedCards)) //Record for auto playing.
					setTimeout(this.resetCards, 1000)
				}
				this.currentState = 0
		}
	},
	resetCards() {
		view.flipCards(...model.revealedCards)
    model.revealedCards = []
	}
}

// Initialize game table.
controller.initializeGame()