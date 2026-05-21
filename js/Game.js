import { Card, NumberCard, BonusCard, SpecialCard } from "./Card.js";

/**
 * Logique principale et gestion de l'état du jeu Flip7
 */
export class Game {
    MAX_PLAYERS_LIMIT = 5;
    MIN_PLAYERS_LIMIT = 2;
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
        for (let i = 12; i >= 0; i--) {
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
        for (let i = 0; i < 3; i++) {
            deck.push(new SpecialCard('SECONDECHANCE'));
            deck.push(new SpecialCard('STOP'));
            deck.push(new SpecialCard('TROISALASUITE'));
        }

        this.#deck = deck;
        this.shuffleDeck();
    }

    getCurrentPlayer() {
        return this.#players[this.#currentPlayer];
    }

    nextPlayer() {
        this.#currentPlayer = (this.#currentPlayer + 1) % this.#players.length;
        let i = 0;
        while (!this.getCurrentPlayer().getCanPlay()) {
            this.#currentPlayer = (this.#currentPlayer + 1) % this.#players.length;
            i++;
            if (i >= this.#players.length) {
                return;
            }
        }

    }

    replacePlayer(oldPlayer, newPlayer) {
        const index = this.#players.indexOf(oldPlayer);
        if (index === -1) return false;

        newPlayer.setHand(oldPlayer.getHand());
        newPlayer.setCanPlay(oldPlayer.getCanPlay());
        newPlayer.setSaute(oldPlayer.getSaute());

        this.#players[index] = newPlayer;
        return true;
    }

    resetRound() {
        this.#round += 1;
        console.log(`Début du round ${this.#round}`);
        for (const player of this.#players) {
            player.setCanPlay(true);
            player.setSaute(false);
            player.setHand([]);
        }
    }

    #checkWin() {
        for (let i = 0; i < this.#players.length; i++) {
            if (this.#scores[i] >= 200) {
                return true;
            }
        }
        return false;
    }

    getWinner() {
        let winnerIndex = 0;
        for (let i = 1; i < this.#players.length; i++) {
            if (this.#scores[i] > this.#scores[winnerIndex]) {
                winnerIndex = i;
            }
        }
        return this.#players[winnerIndex];
    }


    start() {
        this.createDeck();
        this.#scores = new Array(this.#players.length).fill(0);
        this.#currentPlayer = Math.floor(Math.random() * this.#players.length);
        this.#roundStartPlayer = this.#currentPlayer;
        this.#round = 1;
        this.#pile = [];
    }


    getPlayers() {
        return [...this.#players];
    }


    getDeckCount() {
        return this.#deck.length;
    }

    getDeck() {
        return [...this.#deck];
    }

    getPile() {
        return [...this.#pile];
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
            playerWin: this.getWinner()
        };
    }

    checkHasCard(player, card) {
        for (const c of player.getHand()) {
            if (c instanceof card.constructor && c.getNom() == card.getNom()) {
                return true;
            }
        }
        return false;
    }

    removeCard(player, card) {
        let v = [];
        for (const c of player.getHand()) {
            if (!(c instanceof card.constructor && c.getNom() == card.getNom())) {
                v.push(c);
            }
        }
        player.setHand(v);
    }

    checkCanPlayAll() {
        for (const player of this.#players) {
            if (player.getCanPlay()) {
                return true;
            }
        }
        return false;
    }

    async #applySpecialCardEffect(card, status, triggeringPlayer, renderHandCallback, selectPlayerCallBack, forceOther = false) {
        if (status === 'stopCard') {
            let playerlist = this.#players.filter(p => p.getCanPlay());
            if (forceOther) {
                playerlist = playerlist.filter(p => p !== triggeringPlayer);
            }

            let selectedPlayer;
            if (playerlist.length === 0) {
                this.#pile.push(card);
                this.removeCard(triggeringPlayer, new SpecialCard('STOP'));
                return { status: 'givencard', card, player: "Pile" };
            } else if (playerlist.length === 1) {
                selectedPlayer = playerlist[0];
            } else {
                selectedPlayer = await selectPlayerCallBack(playerlist, triggeringPlayer);
            }

            selectedPlayer.setCanPlay(false);
            this.#pile.push(card);
            this.removeCard(triggeringPlayer, new SpecialCard('STOP'));
            if (renderHandCallback) renderHandCallback();
            return { status: 'stopCard', card, playergivencard: selectedPlayer };

        } else if (status === 'secondChanceCard') {
            let playerlist = this.#players.filter(p => p.getCanPlay());
            if (forceOther) {
                playerlist = playerlist.filter(p => p !== triggeringPlayer);
            }

            if (playerlist.length === 0) {
                this.#pile.push(card);
                return { status: 'givencard', card, player: "Pile" };
            }

            let selectedPlayer;
            if (playerlist.length === 1) {
                selectedPlayer = playerlist[0];
            } else {
                selectedPlayer = await selectPlayerCallBack(playerlist, triggeringPlayer);
            }

            selectedPlayer.getHand().push(card);
            if (renderHandCallback) renderHandCallback();
            return { status: 'givencard', card, player: selectedPlayer };

        } else if (status === 'duplicateSpeciale') {
            let playerlist = this.#players.filter(p => !this.checkHasCard(p, card) && p.getCanPlay());
            if (forceOther) {
                playerlist = playerlist.filter(p => p !== triggeringPlayer);
            }

            if (playerlist.length === 0) {
                this.#pile.push(card);
                return { status: 'givencard', card, player: "Pile" };
            } else if (playerlist.length === 1) {
                playerlist[0].getHand().push(card);
                if (renderHandCallback) renderHandCallback();
                return { status: 'givencard', card, player: playerlist[0] };
            } else {
                const selectedPlayer = await selectPlayerCallBack(playerlist, triggeringPlayer);
                selectedPlayer.getHand().push(card);
                if (renderHandCallback) renderHandCallback();
                return { status: 'givencard', card, player: selectedPlayer };
            }
        } else if (status === 'troisAlaSuite') {
            if (renderHandCallback) renderHandCallback();
            let playerlist = this.#players.filter(p => p.getCanPlay());
            if (forceOther) {
                playerlist = playerlist.filter(p => p !== triggeringPlayer);
            }

            let selectedPlayer;
            if (playerlist.length === 0) {
                this.#pile.push(card);
                this.removeCard(triggeringPlayer, new SpecialCard('TROISALASUITE'));
                return { status: 'givencard', card, player: "Pile" };
            } else if (playerlist.length === 1) {
                selectedPlayer = playerlist[0];
            } else {
                selectedPlayer = await selectPlayerCallBack(playerlist, triggeringPlayer);
            }

            this.removeCard(triggeringPlayer, new SpecialCard('TROISALASUITE'));
            this.#pile.push(card);
            if (renderHandCallback) renderHandCallback();

            let specialCardsDrawn = [];
            let stopDealing = false;
            let busted = false;
            let gotFlip7 = false;

            for (let i = 0; i < 3 && !stopDealing; i++) {
                await new Promise(r => setTimeout(r, 800));

                const drawResult = this.#tirerCarte(selectedPlayer, true);
                if (renderHandCallback) renderHandCallback(selectedPlayer);

                if (drawResult.status === 'duplicate') {
                    selectedPlayer.getHand().push(drawResult.card);
                    selectedPlayer.setSaute(true);
                    selectedPlayer.setCanPlay(false);
                    stopDealing = true;
                    busted = true;
                } else if (drawResult.status === 'flip7') {
                    stopDealing = true;
                    gotFlip7 = true;
                } else if (drawResult.status === 'stopCard' || drawResult.status === 'troisAlaSuite' || drawResult.status === 'duplicateSpeciale' || drawResult.status === 'secondChanceCard') {
                    specialCardsDrawn.push(drawResult);
                } else if (drawResult.status === 'empty') {
                    i--;
                    continue;
                }
            }

            if (gotFlip7) {
                for (const p of this.#players) {
                    p.setCanPlay(false);
                }
            }

            for (const sc of specialCardsDrawn) {
                await this.#applySpecialCardEffect(sc.card, sc.status, selectedPlayer, renderHandCallback, selectPlayerCallBack, busted);
            }

            return { status: 'troisAlaSuite', card, player: selectedPlayer, flip7: gotFlip7 };
        }
    }

    /**
     * Exécute l'action d'un joueur
     * @param {string} action - 'T' pour tirer ou 'S' pour s'arrêter
     * @param {function} renderHandCallback - Fonction de rappel pour mettre à jour l'affichage
     * @param {function} selectPlayerCallBack - Fonction pour choisir un joueur cible
     * @returns {object} - Résultat du tour
     */
    async playAction(action, renderHandCallback, selectPlayerCallBack) {
        const normalized = typeof action === 'string' ? action.toUpperCase() : '';

        if (normalized === "T") {
            const result = this.#tirerCarte();

            if (result.status === 'flip7') {
                for (const player of this.#players) {
                    player.setCanPlay(false);
                }
                return { status: 'flip7', card: result.card };
            }

            if (result.status === 'stopCard' || result.status === 'troisAlaSuite') {
                if (renderHandCallback) renderHandCallback();
                const effectResult = await this.#applySpecialCardEffect(result.card, result.status, this.getCurrentPlayer(), renderHandCallback, selectPlayerCallBack);
                return effectResult;
            }

            if (result.status === 'duplicate') {
                this.getCurrentPlayer().getHand().push(result.card);
                this.getCurrentPlayer().setSaute(true);
                this.getCurrentPlayer().setCanPlay(false);
                return result;
            }

            if (result.status !== 'continue' && result.status !== 'empty' && result.status !== 'chance' && result.status !== 'givencard' && result.status !== 'duplicateSpeciale' && result.status !== 'secondChanceCard') {
                this.getCurrentPlayer().setCanPlay(false);
            }

            if (result.status === 'duplicateSpeciale') {
                if (renderHandCallback) renderHandCallback();
                let playerlist = [];
                for (const player of this.#players) {
                    if (!this.checkHasCard(player, result.card) && player.getCanPlay()) {
                        playerlist.push(player);
                    }
                }
                if (playerlist.length != 0) {
                    if (playerlist.length == 1) {
                        playerlist[0].getHand().push(result.card);
                        return { status: 'givencard', card: result.card, player: playerlist[0] };
                    }

                    const selectedPlayer = await selectPlayerCallBack(playerlist);
                    selectedPlayer.getHand().push(result.card);
                    return { status: 'givencard', card: result.card, player: selectedPlayer, playergivencard: selectedPlayer };

                } else {
                    this.#pile.push(result.card);
                    return { status: 'givencard', card: result.card, player: null };
                }
            }
            console.log(`Après action T - Pile: ${this.#pile.length}, status: ${result.status}`);
            return result;
        }

        if (normalized === "S") {
            this.getCurrentPlayer().setCanPlay(false);
            console.log(`Après action S - Pile: ${this.#pile.length}`);
            return { status: 'stopped' };
        }
    }

    endTurn() {
        if (!this.checkCanPlayAll()) {
            this.#calculateScores();
            this.resetRound();
            return { status: 'newRound' };
        }
        this.nextPlayer();
        return { status: 'nextPlayer' };
    }

    #viderDeck(player) {
        for (const card of player.getHand()) {
            this.#pile.push(card);
        }
        player.setHand([]);
    }

    /**
     * Calcule et attribue les points en fonction des cartes en main
     */
    #calculateScores() {
        for (let i = 0; i < this.#players.length; i++) {
            const player = this.#players[i];
            let points = 0;
            if (!player.getSaute()) {
                for (const card of player.getHand()) {
                    if (card instanceof NumberCard) {
                        points += card.getNumero();
                    }
                }

                for (const card of player.getHand()) {
                    if (card instanceof BonusCard) {
                        if (card.getOperation() === 'x') {
                            points *= card.getValeur();
                        }
                    }
                }

                for (const card of player.getHand()) {
                    if (card instanceof BonusCard) {
                        if (card.getOperation() === '+') {
                            points += card.getValeur();
                        }
                    }
                }
                if (this.#checkFlip7(player)) {
                    points += 15;
                }
                this.#scores[i] += points;
            }

            this.#pile.push(...player.getHand());
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
            if (c instanceof NumberCard && card instanceof NumberCard && c.getNumero() == card.getNumero()) {
                return 1;
            }
            if (c instanceof SpecialCard && card instanceof SpecialCard && c.getNom() == card.getNom()) {
                return 2;
            }
        }
        return 0;
    }

    #tirerCarte(targetPlayer = null, isEffectDraw = false) {
        if (this.#deck.length === 0) {
            this.#deck = [...this.#pile];
            this.#pile = [];
            this.shuffleDeck();
            return { status: 'empty' };
        }

        const card = this.#deck.pop();
        const player = targetPlayer || this.getCurrentPlayer();

        console.log("Le joueur " + player.getPseudo() + " a tiré la carte : " + card.getNom());

        const result = this.#checkTooMuchCards(player, card);
        if (result === 1) {
            let cards = new SpecialCard('SECONDECHANCE')
            if (this.checkHasCard(player, cards)) {

                console.log("Le joueur " + player.getPseudo() + " a déjà une carte " + card.getNom() + " dans sa main ! Mais sa carte SECONDECHANCE s'active !");
                this.removeCard(player, cards);
                this.#pile.push(cards);
                this.#pile.push(card);

                return { status: 'chance', card };
            }
            console.log("Le joueur " + player.getPseudo() + " a déjà une carte " + card.getNom() + " dans sa main !");
            return { status: 'duplicate', card };
        }
        if (result === 2) {
            if (card.getNom() === 'SECONDECHANCE') {
                let playerlist = this.#players.filter(p => p.getCanPlay() && !this.checkHasCard(p, card));
                if (playerlist.length === 0) {
                    this.#pile.push(card);
                    return { status: 'givencard', card, player: "Pile" };
                } else if (playerlist.length === 1) {
                    playerlist[0].getHand().push(card);
                    return { status: 'givencard', card, player: playerlist[0] };
                } else {
                    return { status: 'duplicateSpeciale', card };
                }
            }
            console.log("Le joueur " + player.getPseudo() + " a déjà une carte " + card.getNom() + " dans sa main !");
            return { status: 'duplicateSpeciale', card };
        }

        if (isEffectDraw && card instanceof SpecialCard) {
            if (card.getNom() === 'STOP') {
                return { status: 'stopCard', card };
            }
            if (card.getNom() === 'TROISALASUITE') {
                return { status: 'troisAlaSuite', card };
            }
            if (card.getNom() === 'SECONDECHANCE') {
                return { status: 'secondChanceCard', card };
            }
        }

        player.getHand().push(card);

        if (card instanceof SpecialCard) {
            if (card.getNom() === 'STOP') {
                return { status: 'stopCard', card };
            }
            if (card.getNom() === 'TROISALASUITE') {
                return { status: 'troisAlaSuite', card };
            }
            if (card.getNom() === 'SECONDECHANCE') {
                return { status: 'secondChanceCard', card };
            }
        }



        if (this.#checkFlip7(player)) {
            return { status: 'flip7', card };
        }

        return { status: 'continue', card };
    }
}
