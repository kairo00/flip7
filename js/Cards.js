const Chiffre_To_Words = ['ZERO','UN','DEUX','TROIS','QUATRE','CINQ','SIX','SEPT','HUIT','NEUF','DIX','ONZE','DOUZE'];


export class Cards{
    //Classe pour instancier les objets cartes 
    constructor(){
        if (this.constructor === Cards) {
            throw new TypeError('Abstract class "Cards" cannot be instantiated directly');
        }
    }
}

export class BonusCard extends Cards{
    #numero;
    #calcule;
    #nom;
    constructor(numero, calcule){
        super();
        if( ! this.numero in [2, 4, 6, 8, 10]){
            throw new RangeError('The number must be 2, 4, 6, 8 or 10');
        }
        if(calcule != 'x' && calcule != '+'){
            throw new RangeError('The calculation must be either "x" or "+"');
        }
        this.#numero = numero;
        this.#calcule = calcule;
        this.#nom = Chiffre_To_Words[numero] + calcule;
    }
}

export class SpecialCard extends Cards{
    #nom
    constructor(nom){
        super();
        if(nom != 'SECONDECHANCE' && nom != 'STOP' && nom != 'TROISALASUITE'){
            throw new RangeError('The special card name must be either "SECONDECHANCE", "STOP" or "TROISALASUITE"');
        }
        this.#nom = nom;
    }
}

export class NumberCard extends Cards{
    
    #numero;
    #nom;
    constructor(numero){
        super();
        if(this.numero < 0 || this.numero > 12){
            throw new RangeError('The number must be between 0 and 12');
        }
        this.#numero = numero;
        this.#nom = Chiffre_To_Words[numero];
    }
}