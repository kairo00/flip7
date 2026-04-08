const IA_LEVELS = [1, 2];

export class player{
    //Classe pour instancier les objets player
    #pseudo;
    #hand;
    #canPlay;
    constructor(pseudo){
        if (this.constructor === player) {
            throw new TypeError('Abstract class "player" cannot be instantiated directly');
        }
        this.#pseudo = pseudo;
        this.#hand = [];
        this.#canPlay = true;
    }

}

export class HumanPlayer extends player{
    constructor(pseudo){
        super(pseudo);
    }
}

export class ComputerPlayer extends player{ 
    #niveau;
    constructor(pseudo, niveau){
        super(pseudo);
        if(! niveau in IA_LEVELS){
            throw new RangeError('This IA level does not exist.');
        }
        this.#niveau = niveau;
    }
}