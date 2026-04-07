import {Cards, NumberCard, BonusCard, SpecialCard} from "./Cards.js";

document.addEventListener("DOMContentLoaded", function(){

    function createDeck(){
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
        return deck;
    }

    
    function shuffleDeck(deck){
        for(let i = deck.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    let deck = createDeck();

    
    


});