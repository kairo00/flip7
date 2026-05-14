
import {Game} from "./Game.js";
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
    let game = null;
    const ui = new Ui(game);
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
        if (e.target.closest('.btn-rules')) openModal('modal-rules');
        if (e.target.closest('.stats-btn')) openModal('modal-stats');
        if (e.target.closest('.play-btn') && players.length >= 3) {
            const instancedPlayers = players.map(player => {
                if(player.type === 'bot') return new HumanPlayer(player.pseudo);
                if(player.type === 'bot_hard') return new HumanPlayer(player.pseudo);
                    return new HumanPlayer(player.pseudo);
            });
            game = new Game(instancedPlayers);
            game.start();
            ui.renderGameHeader();
            setState(STATES.DEV);
            renderState("Le jeu commence. Cliquez sur Tirer pour jouer.");
        }
        if (e.target.closest('.add-player-btn') && players.length < 5) openModal('modal-add-players');
    });


    //TODO: Fonction reset game nécessaire.
    /** Quit game btn */

/*     document.querySelector('.quit-btn').addEventListener("click", () => {

    }); */


    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('section[id^="modal-"]').classList.add('hidden');
        });
    });

    /** Dark light theme */
    document.querySelector('.secondary-btn').addEventListener('click', () => {
        ui.toggleTheme();
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

    slider.addEventListener("input", (e) => {
        let selected = e.target.value;

        if(selected == 0) {
            status.innerHTML = 'Joueur';
        } else if(selected == 1) {
            status.innerHTML = 'Bot';
        } else if(selected == 2) {
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


    const currentPlayerEl = document.getElementById("current-player");
    const deckCountEl = document.getElementById("deck-count");
    const roundEl = document.getElementById("round");
    const scoresEl = document.getElementById("scores");
    const messageEl = document.getElementById("message");
    const btnTirer = document.getElementById("btn-tirer");
    const btnStop = document.getElementById("btn-stoper");

    function renderHand(player){
        if(player.getHand().length === 0){
            return;
        }
        for (const card of player.getHand()){
            ui.renderCard(card);
        }
    }

    function renderState(message = ""){
        const state = game.getState();
        currentPlayerEl.textContent = `Joueur actif : ${state.currentPlayerPseudo}`;
        deckCountEl.textContent = `Cartes restantes : ${state.deckCount}`;
        roundEl.textContent = `Round : ${state.round}`;
        scoresEl.textContent = `Scores : ${state.scores.map((score, i) => `${game.getPlayers()[i].getPseudo()}: ${score}`).join(', ')}`;
        messageEl.textContent = message;
        renderHand(game.getCurrentPlayer());
    }


    function endGame(message){
        messageEl.textContent = message;
        btnTirer.disabled = true;
        btnStop.disabled = true;
    }

    function handleAction(action){
        const result = game.playAction(action);
        switch(result.status){
            case "continue":
                renderState("Carte tirée. Continuez ou stoppez.");
                break;
            case "flip7":
                renderState("Flip 7 ! Tour terminé.");
                break;
            case "duplicate":
                renderState("Carte déjà présente. Tour terminé.");
                document.getElementById('hand-area').childNodes.forEach(node => { node.remove(); });
                break;
            case "empty":
                renderState("Le deck est vide. Deck reshufflé vous pouvez tirer une carte.");           
                break;
            case "stopped":
                renderState("Tour arrêté. Joueur suivant.");
                document.getElementById('hand-area').childNodes.forEach(node => { node.remove(); });
                break;
            default:
                renderState("");
        }

        if(game.getState().gameOver){
            endGame("Le jeu est terminé.");
        }
    }

    btnTirer.addEventListener("click", function(){
        handleAction("T");
    });

    btnStop.addEventListener("click", function(){
        handleAction("S");
    });

});