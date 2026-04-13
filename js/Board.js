import {Cards, NumberCard, BonusCard, SpecialCard} from "./Cards.js";

export class Board{
    #players;
    #scores;
    #deck;
    #pile;
    #round;
    #currentPlayer;
    constructor(players){
        this.#players = players;
        this.#scores = [];
        this.#deck = [];
        this.#pile = [];
        this.#round = 0;
        this.#currentPlayer = 0;
    }

    shuffleDeck(){
        for(let i = this.#deck.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.#deck[i], this.#deck[j]] = [this.#deck[j], this.#deck[i]];
        }
    }


    createDeck(){
        let deck = [];

        //cartes number
        for(let i = 12; i >= 0 ; i--){
            for(let j = 1; j <= i ; j++){
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

    nextPlayer(){
        this.#currentPlayer = (this.#currentPlayer + 1) % this.#players.length;
    }

    resetRound(){
        this.#round += 1;
        this.#pile = [];
    }

    #checkWin(){
        for(let i = 0; i < this.#players.length; i++){
            if(this.#scores[i] >= 200){
                return true;
            }
        }
        return false;
    }

    start(){
        console.log("Le jeu commence !");
        this.createDeck();
        for (let i = 0; i < this.#players.length; i++) {
            this.#scores.push(0);
        }
        this.#currentPlayer = Math.floor(Math.random() * (this.#players.length));
        let end = 0;
        while(!this.#checkWin() && end < 5){
            this.resetRound();
            this.#startRound();
            end++;
        }
        
    }

    #tirerCarte(input){
        if(input !== null && input.toUpperCase() === "T"){
                let card = this.#deck.pop();
                
                console.log("Vous avez tiré la carte : " + card.getNumero() + " " + card.getNom());
                this.#players[this.#currentPlayer].getHand().push(card);
                return card;
        }
        return null;
    }


    #startRound(){
        for(let i = 0; i < this.#players.length; i++){
            console.log("C'est au tour de " + this.#players[this.#currentPlayer].getPseudo());
            let input = prompt("Tirer ou STOP ? (T/S)");
            let card = this.#tirerCarte(input);

            if(card === null){
                break;
            }
            this.nextPlayer();
        }
    }
    
    
}
