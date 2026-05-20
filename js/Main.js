
import {Game} from "./game.js";
import {HumanPlayer} from "./Player.js";
import {Ui} from "./Ui.js";

const STATES = {
  HOME: 'home',
  WAITROOM: 'waitroom',
  GAME: 'game',
  ENDGAME: 'endgame',
  DEV: 'dev',
};

let currentState = STATES.HOME;

document.addEventListener("DOMContentLoaded", function(){

    /** Game view */

    let players = [];
    for(let i = 0; i < 3; i++) {
        players.push(new HumanPlayer(`Hugo`));
    }
    let game = null;
    let ui = new Ui(game);
    ui.initTheme();
    ui.initBackground();
    ui.initLogo();
    ui.renderNavbar('view-home');
    ui.renderNavbar('view-waitroom');

    /** Nav */

    function setState(newState) {
        currentState = newState;
        render();
    }

    function render() {
        document.querySelectorAll('section[id^="view-"]').forEach(s => s.classList.add('hidden'));
        document.getElementById(`view-${currentState}`).classList.remove('hidden');
    }

    function openModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    function closeModal(id) {
        document.getElementById(id).classList.add('hidden');
    }

    setState(STATES.HOME);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.theme-btn')) ui.toggleTheme();
        if (e.target.closest('.btn-rules')) openModal('modal-rules');
        if (e.target.closest('.stats-btn')) openModal('modal-stats');
        if (e.target.closest('.play-btn') && players.length >= 3) {
            const instancedPlayers = players.map(player => {
                if(player.type === 'bot') return new HumanPlayer(player.pseudo);
                if(player.type === 'bot_hard') return new HumanPlayer(player.pseudo);
                    return new HumanPlayer(player.pseudo);
            });
            game = new Game(instancedPlayers);
            ui.setGame(game);
            game.start();
            ui.renderGameHeader();
            setState(STATES.GAME);
            ui.renderState("Le jeu commence. Cliquez sur Tirer pour jouer.");
        }
        if (e.target.closest('.add-player-btn') && players.length < 5) openModal('modal-add-players');
    });


    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('section[id^="modal-"]').classList.add('hidden');
        });
    });


    /** Add player */
    document.querySelector('form').addEventListener("submit", function(e) {
        e.preventDefault();
        let selectPlayerType = document.querySelector('.type-slider').value;
        let pseudo = document.getElementById('pseudo').value;
        
        if(players.some(player => player.pseudo === pseudo)) {
            ui.renderError('Pseudo déjà utilisé', 'Ce pseudo est déjà utilisé, trouve en un autre...');
            return;
        }

        if(pseudo.length > 16 || pseudo.length < 2) {
            ui.renderError('Longueur de pseudo invalide', 'Le pseudo doit faire entre 2 et 16 caractères');
            return;
        }

        let regexp = /^_/;
        if(selectPlayerType === '0' && regexp.test(pseudo)) {
            ui.renderError("Le caractères '_' est réservé au bot !", 'Le. pseudo d\'un joueur doit obligatoirement commencer par une lettre majuscule.');
            return;
        }

        if(selectPlayerType === '1' && selectPlayerType === '2' && regexp.test(pseudo)) {
            ui.renderError("Oops tu dois laisser le underscore...", "Le pseudo du bot doit commencer par '_'");
            return;
        }


        regexp = /^_?[A-Z](-?[a-z0-9]+)*$/;
        if(!regexp.test(pseudo)) {
            ui.renderError('Caractères invalides !', 'Le pseudo doit commencer par une lettre majuscule, seul les caractères suivants sont autorisés : a-z, A-Z, 0-9, -');
            return;
        }


        if(selectPlayerType === '0') {
            players.push({pseudo: `${pseudo}`, type: "Joueur"});
        } else if(selectPlayerType === '1') {
            players.push({pseudo: `${pseudo}`, type: "Bot"});
        } else if(selectPlayerType === '2') {
            players.push({pseudo: `${pseudo}`, type: "Bot hard"});
        }
        closeModal('modal-add-players');
        setState(STATES.WAITROOM);
        console.log(players.length);
        ui.updatePlayButton(players.length);
        ui.updateAddPlayerButton(players.length);
        ui.renderWaitroom(players);
    });

    /** Raccourcis clavier (fermer un modal) */
    document.body.addEventListener("keydown", (e) => {
        if((e.key === 'Escape' || e.key === 'q') && document.querySelector("input:focus") !== document.querySelector("input[name='pseudo']")) {
            let openModal = document.querySelector('section[id^="modal-"]:not(.hidden)');
            if(openModal) {
                closeModal(openModal.id);
            }
        }
    });

    const input = document.querySelector('input[type=text]');

    input.addEventListener('keydown', (e) => {
        input.classList.add('pressed');
    });

    input.addEventListener('keyup', () => {
        input.classList.remove('pressed');
    });



    let status = document.getElementById('status');
    let slider = document.querySelector('.type-slider');
    let inputPseudo = document.getElementById('pseudo');

    slider.addEventListener("input", (e) => {
        let selected = e.target.value;

        if(selected == 0) {
            if(inputPseudo.value.startsWith('_')) inputPseudo.value = inputPseudo.value.substring(1);
            status.innerHTML = 'Joueur';
        } else if(selected == 1) {
            if(!inputPseudo.value.startsWith('_')) inputPseudo.value = '_' + inputPseudo.value;
            status.innerHTML = 'Bot';

        } else if(selected == 2) {
            if(!inputPseudo.value.startsWith('_')) inputPseudo.value = '_' + inputPseudo.value;
            status.innerHTML = 'Bot Hard';
        }
    });

    /** Pour delete les joueurs dans la waitroom */
    document.body.addEventListener('click', (e) => {
        if(e.target.closest('.delete-player')) {
            const index = e.target.closest('.player').dataset.index;
            players.splice(index, 1);
            ui.renderWaitroom(players);
            if(players.length === 0) {
                setState(STATES.HOME);
            }
            ui.updatePlayButton(players.length);
            ui.updateAddPlayerButton(players.length);
        }
    });

    async function getStatistique() {

    }

    /**
     * Partie du jeu
     */

    function handleAction(action){
        const result = game.playAction(action);
        switch(result.status){
            case "continue":
                ui.renderState("Carte tirée. Continuez ou stoppez.");
                break;
            case "flip7":
                ui.renderState("Flip 7 ! Tour terminé.");
                break;
            case "duplicate":
                ui.renderNextPlayer();
                ui.renderState("Carte déjà présente. Tour terminé.");
                ui.renderDiscardPile(game.getPile());
                break;
            case "empty":
                ui.renderState("Le deck est vide. Deck reshufflé vous pouvez tirer une carte.");           
                break;
            case "stopped":
                ui.renderNextPlayer();
                ui.renderState("Tour arrêté. Joueur suivant.");
                ui.renderDiscardPile(game.getPile());
                break;
            default:
                ui.renderState("");
        }

        if(game.getState().gameOver){
            ui.endGame("Le jeu est terminé.");
        }
    }

    document.getElementById('hit-btn').addEventListener("click", function(){
        handleAction("T");
    });

    document.getElementById('stop-btn').addEventListener("click", function(){
        handleAction("S");
    });

});