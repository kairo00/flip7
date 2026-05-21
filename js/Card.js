const NUMBER_TO_WORD = ['ZERO', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF', 'DIX', 'ONZE', 'DOUZE'];
const SPECIAL_CARDS = ['SECONDECHANCE', 'STOP', 'TROISALASUITE'];

export class Card {
    constructor() {
        if (this.constructor === Card) {
            throw new TypeError('Abstract class "Card" cannot be instantiated directly');
        }
    }

    getNom() {
        throw new Error("La méthode 'getNom()' doit être implémentée par la classe enfant.");
    }
}

/**
 * represente une carte bonus avec un nombre et operation (+ ou x)
 */
export class BonusCard extends Card {
    #valeur;
    #operation
    constructor(valeur, operation) {
        super();
        if (![2, 4, 6, 8, 10].includes(valeur)) {
            throw new RangeError('The number must be 2, 4, 6, 8 or 10');
        }
        if (operation != 'x' && operation != '+') {
            throw new RangeError('The calculation must be either "x" or "+"');
        }
        this.#valeur = valeur;
        this.#operation = operation;
    }

    getValeur() {
        return this.#valeur;
    }


    getOperation() {
        return this.#operation;
    }

    getNom() {
        return `${this.#operation}${this.#valeur}`;
    }
}

/**
 * Crée une carte spéciale à partir des noms prédéfinis
 */
export class SpecialCard extends Card {
    #nom
    constructor(nom) {
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

export class NumberCard extends Card {
    #numero
    constructor(numero) {
        super();
        if (numero < 0 || numero > 12) {
            throw new RangeError('The number must be between 0 and 12');
        }
        this.#numero = numero;
    }

    getNumero() {
        return this.#numero;
    }

    getNom() {
        return NUMBER_TO_WORD[this.#numero];
    }
}