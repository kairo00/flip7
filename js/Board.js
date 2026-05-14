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
        // for (let i = 12; i >= 0; i--) {
        //     for (let j = 1; j <= i; j++) {
        //         deck.push(new NumberCard(i));
        //     }
        // }
        // deck.push(new NumberCard(0));

        //cartes bonus
        // deck.push(new BonusCard(2, 'x'));
        // deck.push(new BonusCard(2, '+'));
        // deck.push(new BonusCard(4, '+'));
        // deck.push(new BonusCard(6, '+'));
        // deck.push(new BonusCard(8, '+'));
        // deck.push(new BonusCard(10, '+'));

        //cartes speciales
        for(let i = 0; i < 3; i++){
            deck.push(new SpecialCard('SECONDECHANCE'));
            //deck.push(new SpecialCard('STOP'));
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
        while(!this.getCurrentPlayer().getCanPlay()){
            this.#currentPlayer = (this.#currentPlayer + 1) % this.#players.length;
            i++;
            if(i >= this.#players.length){
                return;
            }
        } 
        
    }

    resetRound() {
        this.#round += 1;
        console.log(`Début du round ${this.#round}`);
        for(const player of this.#players){
            player.setCanPlay(true);
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

    checkHasCard(player, card) {
        for (const c of player.getHand()) {
            if ( c instanceof card.constructor && c.getNom() == card.getNom()) {
                return true;
            }
        }
        return false;
    }

    removeCard(player, card) {
        let v = [];
        for (const c of player.getHand()) {
            if ( !(c instanceof card.constructor && c.getNom() == card.getNom())) {
                v.push(c);
            }
        }
        player.setHand(v);
    }
                


    checkCanPlayAll(){
        for(const player of this.#players){
            if(player.getCanPlay()){
                return true;
            }
        }
        return false;
    }

    async playAction(action, boutton){
        const normalized = typeof action === 'string' ? action.toUpperCase() : '';

        if (normalized === "T") {
            const result = this.#tirerCarte();
            
            if(result.status !== 'continue' && result.status !== 'empty'){
                this.getCurrentPlayer().setCanPlay(false);
            }
            if(result.status !== 'empty' && result.status !== 'duplicateSpeciale'){
                this.nextPlayer();
            }
            if(result.status === 'duplicateSpeciale'){
                boutton.stop.disabled = true;
                boutton.tirer.disabled = true;

                let playerlist = [];
                
                for(const player of this.#players){
                    if(!this.checkHasCard(player, result.card)){ 
                        playerlist.push(player);
                    }
                }
                console.log(playerlist.length);
                if(playerlist.length != 0){
                    if(playerlist.length == 1){
                        playerlist[0].getHand().push(result.card);
                        boutton.stop.disabled = false;
                        boutton.tirer.disabled = false;
                        return {status: 'givencard', card: result.card, player: playerlist[0]};
                    }
                    
                    const givenCard = await new Promise((resolve) => {
                        let divselector = document.createElement('div') 
                        divselector.id = 'nomHugoLeBoss';
                        let selector = document.createElement('select');
                        selector.id = 'selector';

                        let option = document.createElement('option');
                        option.value = '';
                        option.disabled = true;
                        option.selected = true;
                        option.text = 'Choisissez un joueur';
                        selector.appendChild(option);
                        let playerDict = {};

                        for(let i = 0; i < playerlist.length; i++){
                            playerDict[playerlist[i].getPseudo()] = playerlist[i];
                            option = document.createElement('option');
                            option.value = playerlist[i].getPseudo();
                            option.text = playerlist[i].getPseudo();
                            selector.appendChild(option);
                        }
                    
                        divselector.appendChild(selector);
                        document.body.appendChild(divselector);

                        selector.addEventListener('change', function () {
                            if(this.value !== ''){
                                console.log("Selected player: " + playerDict[this.value].getPseudo());
                                playerDict[this.value].getHand().push(result.card);
                                document.body.removeChild(divselector);
                                boutton.stop.disabled = false;
                                boutton.tirer.disabled = false;
                                resolve({status: 'givencard', card: result.card, player: playerDict[this.value]});
                            }
                        });
                    });
                    
                    return givenCard;

                }else {
                    this.#pile.push(result.card);
                    boutton.stop.disabled = false;
                    boutton.tirer.disabled = false;
                }

                console.log("test");

                
            }
            if (!this.checkCanPlayAll()) {
                this.#calculateScores();

                this.resetRound();
            }
            console.log(`Après action T - Pile: ${this.#pile.length}, status: ${result.status}`);
            return result;
        }

        if (normalized === "S") {
            this.getCurrentPlayer().setCanPlay(false);
            this.nextPlayer();
            if (!this.checkCanPlayAll()) {
                this.#calculateScores();

                this.resetRound();
            }
            console.log(`Après action S - Pile: ${this.#pile.length}`);
            return { status: 'stopped' };
        }

    
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
                return 1;
            }
            if(c instanceof SpecialCard && c.getNom() == card.getNom()){
                return 2;
            }
        }
        return 0;
    }

    #tirerCarte() {
        if (this.#deck.length === 0) {
            this.#deck = [...this.#pile];
            this.#pile = [];
            this.shuffleDeck();
            return { status: 'empty' };
        }

        const card = this.#deck.pop();
        const player = this.getCurrentPlayer();

        console.log("Vous avez tiré la carte : " + card.getNumero() + " " + card.getNom());

        const result = this.#checkTooMuchCards(player, card);
        if (result === 1) {
            let cards = new SpecialCard('SECONDECHANCE')
            if(this.checkHasCard(this.#players[this.#currentPlayer], cards)){

                console.log("Vous avez déjà une carte " + card.getNumero() + " dans votre main ! Mais votre carte SECONDECHANCE s'active !");
                this.removeCard(this.#players[this.#currentPlayer], cards);

                return { status: 'chance', card };
            }
            console.log("Vous avez déjà une carte " + card.getNumero() + " dans votre main !");
            return { status: 'duplicate', card };
        }
        if (result === 2) {
            console.log("Vous avez déjà une carte " + card.getNom() + " dans votre main !");
            return { status: 'duplicateSpeciale', card };
        }

        player.getHand().push(card);
        if (this.#checkFlip7(player)) {
            return { status: 'flip7', card };
        }

        return { status: 'continue', card };
    }
}
