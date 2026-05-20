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
        if(! niveau in IA_LEVELS){
            throw new RangeError('This IA level does not exist.');
        }
        this.#niveau = niveau;
    }

    makeDecision(){
        if(this.#niveau ==1){
            //IA niveau 1 : tire toujours la premiere carte, puis fait aleatoirement le choix de tirer ou stopper
            if(this.getHand().length == 0){
                return "T";
            }
            return Math.random() < 0.5 ? "T" : "S";
            
        }

    }
}