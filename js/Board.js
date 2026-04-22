import { Cards, NumberCard, BonusCard, SpecialCard } from "./Cards.js";

export class Board {
    #players;
    #scores;
    #deck;
    #pile;
    #round;
    #currentPlayer;
    #roundStartPlayer;
    constructor(players) {
        this.#players = players;
        this.#scores = [];
        this.#deck = [];
        this.#pile = [];
        this.#round = 0;
        this.#currentPlayer = 0;
        this.#roundStartPlayer = -1;
    }

    shuffleDeck() {
        for (let i = this.#deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.#deck[i], this.#deck[j]] = [this.#deck[j], this.#deck[i]];
        }
    }


    createDeck() {
        let deck = [];

        //cartes number
        for (let i = 4; i >= 0; i--) {
            for (let j = 1; j <= i; j++) {
                deck.push(new NumberCard(i));
            }
        }
        deck.push(new NumberCard(0));

        //cartes bonus
        deck.push(new BonusCard(2, 'x'));
        deck.push(new BonusCard(2, '+'));
        deck.push(new BonusCard(4, '+'));
        deck.push(new BonusCard(6, '+'));
        deck.push(new BonusCard(8, '+'));
        deck.push(new BonusCard(10, '+'));

        //cartes speciales
        for(let i = 0; i < 3; i++){
            deck.push(new SpecialCard('SECONDECHANCE'));
            deck.push(new SpecialCard('STOP'));
            deck.push(new SpecialCard('TROISALASUITE'));
        }
        this.#deck = deck;
        this.shuffleDeck();
    }

    nextPlayer() {
        this.#currentPlayer = (this.#currentPlayer + 1) % this.#players.length;
    }

    resetRound() {
        this.#round += 1;
        console.log(`Début du round ${this.#round}`);
    }

    #checkWin() {
        for (let i = 0; i < this.#players.length; i++) {
            if (this.#scores[i] >= 200) {
                return true;
            }
        }
        return false;
    }

    start() {
        this.createDeck();
        this.#scores = new Array(this.#players.length).fill(0);
        this.#currentPlayer = Math.floor(Math.random() * this.#players.length);
        this.#roundStartPlayer = this.#currentPlayer;
        this.#round = 1;
        this.#pile = [];
    }

    getCurrentPlayer() {
        return this.#players[this.#currentPlayer];
    }

    getPlayers() {
        return [...this.#players];
    }

    getDeckCount() {
        return this.#deck.length;
    }

    getState() {
        return {
            players: this.#players.map(player => ({
                pseudo: player.getPseudo(),
                hand: [...player.getHand()],
                canPlay: player.getCanPlay()
            })),
            scores: [...this.#scores],
            currentPlayerIndex: this.#currentPlayer,
            currentPlayerPseudo: this.getCurrentPlayer().getPseudo(),
            round: this.#round,
            deckCount: this.getDeckCount(),
            pile: [...this.#pile],
            gameOver: this.#checkWin(),
        };
    }

    playAction(action) {
        const normalized = typeof action === 'string' ? action.toUpperCase() : '';

        if (normalized === "T") {
            const result = this.#tirerCarte();
            if (result.status !== 'continue' && result.status !== 'empty') {
                this.nextPlayer();
                if (this.#currentPlayer === this.#roundStartPlayer) {
                    this.#calculateScores();
                    this.resetRound();
                }
            }
            console.log(`Après action T - Pile: ${this.#pile.length}, status: ${result.status}`);
            return result;
        }

        if (normalized === "S") {
            this.nextPlayer();
            if (this.#currentPlayer === this.#roundStartPlayer) {
                this.#calculateScores();
                this.resetRound();
            }
            console.log(`Après action S - Pile: ${this.#pile.length}`);
            return { status: 'stopped' };
        }

        throw new RangeError('Action must be "T" or "S".');
    }

    #viderDeck(player) {
        for (const card of player.getHand()) {
            this.#pile.push(card);
        }
        player.setHand([]);
    }

    #calculateScores() {
        for (let i = 0; i < this.#players.length; i++) {
            const player = this.#players[i];
            let points = 0;
            for (const card of player.getHand()) {
                if (card instanceof NumberCard) {
                    points += card.getNumero();
                }
            }
            this.#scores[i] += points;
            console.log(`${player.getPseudo()} gagne ${points} points. Score total: ${this.#scores[i]}`);
        }
        
        for (const player of this.#players) {
            this.#viderDeck(player);
        }
    }

    #checkFlip7(player) {
        if (player.getHand().length >= 7) {
            let count = 0;
            for (const card of player.getHand()) {
                if (card instanceof NumberCard) {
                    count++;
                }
            }
            return count >= 7;
        }
        return false;
    }

    #checkTooMuchCards(player, card) {
        for (const c of player.getHand()) {
            if (c instanceof NumberCard && c.getNumero() == card.getNumero()) {
                return true;
            }
        }
        return false;
    }

    #tirerCarte() {
        if (this.#deck.length === 0) {
            this.#deck = [...this.#pile];
            this.#pile = [];
            this.shuffleDeck();
            return { status: 'empty' };
        }

        const card = this.#deck.pop();
        const player = this.#players[this.#currentPlayer];

        console.log("Vous avez tiré la carte : " + card.getNumero() + " " + card.getNom());

        if (this.#checkTooMuchCards(player, card)) {
            console.log("Vous avez déjà une carte " + card.getNumero() + " dans votre main !");
            return { status: 'duplicate', card };
        }

        player.getHand().push(card);
        if (this.#checkFlip7(player)) {
            return { status: 'flip7', card };
        }

        return { status: 'continue', card };
    }
}

