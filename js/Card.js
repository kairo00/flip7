<<<<<<< HEAD
const NUMBER_TO_WORD = ['ZERO','UN','DEUX','TROIS','QUATRE','CINQ','SIX','SEPT','HUIT','NEUF','DIX','ONZE','DOUZE'];
const SPECIAL_CARDS = ['SECONDECHANCE', 'STOP', 'TROISALASUITE'];

export class Card{
    //Classe pour instancier les objets cartes 
    constructor(){
        if (this.constructor === Card) {
            throw new TypeError('Abstract class "Card" cannot be instantiated directly');
=======
const Chiffre_To_Words = ['ZERO','UN','DEUX','TROIS','QUATRE','CINQ','SIX','SEPT','HUIT','NEUF','DIX','ONZE','DOUZE'];


export class Cards{
    //Classe pour instancier les objets cartes 
    _nom;
    _numero;
    constructor(){
        if (this.constructor === Cards) {
            throw new TypeError('Abstract class "Cards" cannot be instantiated directly');
>>>>>>> origin/develop
        }
    }

    getNom(){
<<<<<<< HEAD
        throw new Error("La méthode 'getNom()' doit être implémentée par la classe enfant.");
    }
}

export class BonusCard extends Card{
    #valeur;
    #operation
    constructor(valeur, operation){
        super();
        if(![2, 4, 6, 8, 10].includes(valeur)){
            throw new RangeError('The number must be 2, 4, 6, 8 or 10');
        }
        if(operation != 'x' && operation != '+'){
            throw new RangeError('The calculation must be either "x" or "+"');
        }
        this.#valeur = valeur;
        this.#operation = operation;
    }

    getValeur() {
        return this.#valeur;
    }


    getOperation(){
        return this.#operation;
    }

    getNom() {
        return `${this.#operation}${this.#valeur}`;
    }
}

export class SpecialCard extends Card{
    #nom
    constructor(nom){
        super();

        if (!SPECIAL_CARDS.includes(nom)) {
            throw new RangeError(`Carte spéciale invalide : ${nom}`);
        }

        this.#nom = nom;
    }

    getNom() {
        return this.#nom;
    }
}

export class NumberCard extends Card{
    #numero
=======
        return this._nom;
    }

    getNumero(){
        return this._numero;
    }
}

export class BonusCard extends Cards{
    _calcule;
    constructor(numero, calcule){
        super();
        if(![2, 4, 6, 8, 10].includes(numero)){
            throw new RangeError('The number must be 2, 4, 6, 8 or 10');
        }
        if(calcule != 'x' && calcule != '+'){
            throw new RangeError('The calculation must be either "x" or "+"');
        }
        this._numero = numero;
        this._calcule = calcule;
        this._nom = Chiffre_To_Words[numero] + calcule;
    }


    getCalcule(){
        return this._calcule;
    }
}

export class SpecialCard extends Cards{
    constructor(nom){
        super();
        if(nom != 'SECONDECHANCE' && nom != 'STOP' && nom != 'TROISALASUITE'){
            throw new RangeError('The special card name must be either "SECONDECHANCE", "STOP" or "TROISALASUITE"');
        }
        this._nom = nom;
        this._numero = -1;
    }


}

export class NumberCard extends Cards{
>>>>>>> origin/develop
    constructor(numero){
        super();
        if(numero < 0 || numero > 12){
            throw new RangeError('The number must be between 0 and 12');
        }
<<<<<<< HEAD
        this.#numero = numero;
    }

    getNumero() { 
        return this.#numero; 
    }

    getNom() {
        return NUMBER_TO_WORD[this.#numero];
    }
=======
        this._numero = numero;
        this._nom = Chiffre_To_Words[numero];
    }


>>>>>>> origin/develop
}