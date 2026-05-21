const Chiffre_To_Words = ['ZERO','UN','DEUX','TROIS','QUATRE','CINQ','SIX','SEPT','HUIT','NEUF','DIX','ONZE','DOUZE'];


export class Cards{
    //Classe pour instancier les objets cartes 
    _nom;
    _numero;
    constructor(){
        if (this.constructor === Cards) {
            throw new TypeError('Abstract class "Cards" cannot be instantiated directly');
        }
    }

    getNom(){
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
    constructor(numero){
        super();
        if(numero < 0 || numero > 12){
            throw new RangeError('The number must be between 0 and 12');
        }
        this._numero = numero;
        this._nom = Chiffre_To_Words[numero];
    }


}