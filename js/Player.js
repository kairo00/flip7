import { NumberCard, SpecialCard, BonusCard } from "./Card.js";
const IA_LEVELS = [1, 2];

export class Player{
    //Classe pour instancier les objets player
    #pseudo;
    #hand;
    #canPlay;
    #saute;
    constructor(pseudo){
        if (this.constructor === Player) {
            throw new TypeError('Abstract class "Player" cannot be instantiated directly');
        }
        this.#pseudo = pseudo;
        this.#hand = [];
        this.#canPlay = true;
        this.#saute = false;
    }

    getPseudo(){
        return this.#pseudo;
    }

    getSaute(){
        return this.#saute;
    }

    setSaute(saute){
        this.#saute = saute;
    }

    getHand(){
        return this.#hand;
    }

    setHand(hand){
        this.#hand = hand;
    }

    getCanPlay(){
        return this.#canPlay;
    }

    setCanPlay(canPlay){
        this.#canPlay = canPlay;
    }

}

export class HumanPlayer extends Player{
    constructor(pseudo){
        super(pseudo);
    }
}

export class ComputerPlayer extends Player{ 
    #niveau;
    constructor(pseudo, niveau){
        super(pseudo);
        if(! IA_LEVELS.includes(niveau)){
            throw new RangeError('This IA level does not exist.');
        }
        this.#niveau = niveau;
    }

    getNiveau() {
        return this.#niveau;
    }

    makeDecision(board){

        if(this.#niveau==1){
            if(this.getHand().length==0){
                return "T";
            }
            const hand=this.getHand();
            const hasSecondChance = hand.some(c=>c instanceof SpecialCard && c.getNom() === 'SECONDECHANCE');
            if(hasSecondChance){
                return "T";
            }
            return Math.random() < 0.55 ? "T" : "S";
        }

        if(this.#niveau==2){

            if(this.getHand().length==0){
                return "T";
            }

            const state=board.getState();
            const hand=this.getHand();

            const initialDist={
                'Number_0':1,'Number_1':1,'Number_2':2,'Number_3':3,'Number_4':4,
                'Number_5':5,'Number_6':6,'Number_7':7,'Number_8':8,'Number_9':9,
                'Number_10':10,'Number_11':11,'Number_12':12,
                'Bonus_2x':1,'Bonus_2+':1,'Bonus_4+':1,'Bonus_6+':1,'Bonus_8+':1,'Bonus_10+':1,
                'Special_SECONDECHANCE':3,'Special_STOP':3,'Special_TROISALASUITE':3
            };

            const seen={};

            function registerCard(carte){

                let nomUnique;

                if(carte instanceof NumberCard){
                    nomUnique= "Number_"+carte.getNumero();
                }
                else if(carte instanceof BonusCard){
                    nomUnique= "Bonus_"+carte.getValeur()+carte.getOperation();
                }
                else if(carte instanceof SpecialCard){
                    nomUnique= "Special_"+carte.getNom();
                }

                if(nomUnique !== undefined){
                    seen[nomUnique] = (seen[nomUnique]||0) + 1;
                }
            }

            state.pile.forEach(registerCard);

            for(let p of board.getPlayers()){
                for(let carte of p.getHand()){
                    registerCard(carte);
                }
            }

            const hasSecondChance = hand.some(c=>c instanceof SpecialCard && c.getNom() === 'SECONDECHANCE');

            let currentPoints=0;
            let uniqueNums=new Set();

            for(let c of hand){
                if(c instanceof NumberCard){
                    currentPoints +=  c.getNumero();
                    uniqueNums.add(c.getNumero());
                }
            }

            const uniqueCount=uniqueNums.size;

            let totalInDeck=0;
            let bustCardsInDeck=0;

            for(const key in initialDist){

                const remaining=Math.max(0,initialDist[key]-(seen[key]||0));

                totalInDeck+=remaining;

                if(key.startsWith('Number_')){

                    const num=parseInt(key.split('_')[1]);

                    const alreadyHave=hand.some(c=>c instanceof NumberCard&&c.getNumero()===num);

                    if(alreadyHave){
                        bustCardsInDeck+=remaining;
                    }
                }
            }

            const bustProba= totalInDeck > 0 ? bustCardsInDeck/totalInDeck : 1;

            let risk = 0.58-(currentPoints*0.0065)-(uniqueCount*0.03);

            if(hasSecondChance){
                risk += 0.15;
            }


            if(uniqueCount === 6){
                risk += 0.12;
                if(hasSecondChance) risk += 0.08;
            }

            
            let bestEnemyScore = 0;

            for ( let i = 0 ; i < board.getPlayers().length; i++) {
                const p = board.getPlayers()[i];
                const scorePlayer = state.scores[i];
                if (p !== this) {
                    bestEnemyScore = Math.max(bestEnemyScore, scorePlayer);
                }
            }

            const myIndex = board.getPlayers().indexOf(this);
            const myScore = state.scores[myIndex];

            if(bestEnemyScore > myScore+40){
                risk += 0.10;
            }

            if(myScore > bestEnemyScore+30){
                risk -= 0.10;
            }

            risk = Math.max(0.05, Math.min(0.60, risk));

            return bustProba < risk ? "T" : "S";
        }
    }

    async getIndexPlayerList(playerlist){
        await new Promise(r => setTimeout(r, 1000));
        if(this.#niveau == 1){
            return Math.floor(Math.random() * playerlist.length);
        }
        if(this.#niveau == 2){
            let targetIdx = 0;
            let maxCards = -1;
            for(let i = 0; i < playerlist.length; i++){
                if(playerlist[i].getHand().length > maxCards){
                    maxCards = playerlist[i].getHand().length;
                    targetIdx = i;
                }
            }
            return targetIdx;
        }
    }
}