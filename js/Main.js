
import {Game} from "./Game.js";
import {HumanPlayer, ComputerPlayer} from "./Player.js";
import {Ui} from "./Ui.js";

const STATES = {
  HOME: 'home',
  WAITROOM: 'waitroom',
  GAME: 'game',
  ENDGAME: 'endgame',
  DEV: 'dev',
};

let lockButton = false;
let currentState = STATES.ENDGAME;

let isGamePaused = false;
let playerWantToQuit = null;

document.addEventListener("DOMContentLoaded", function(){

    /** Game view */

    let players = [];
    players.push({pseudo: "Hugo", type: "player"});
    players.push({pseudo: "_Bot1", type: "bot"});
    players.push({pseudo: "_Bot2", type: "bot_hard"});
    let game = null;
    let ui = new Ui(game);
    ui.initTheme();
    ui.initBackground();
    ui.initLogo();
    ui.renderNavbar('view-home');
    ui.renderNavbar('view-waitroom');

    /** Nav */

    if (!document.getElementById('modal-confirm-quit')) {
        const quitModal = document.createElement('section');
        quitModal.id = 'modal-confirm-quit';
        quitModal.className = 'hidden';
        quitModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h2>Voulez-vous vraiment abandonner ?</h2>
                <p>Un Bot prendra le relai et terminera la partie à votre place.</p>
                <div class="buttons">
                    <button id="btn-cancel-quit" class="secondary-btn">Annuler</button>
                    <button id="btn-confirm-quit" class="primary-btn">Oui, quitter</button>
                </div>
            </div>
        `;
        document.body.appendChild(quitModal);
    }


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

      async function getStatistique() {
        try {
            const response = await fetch('/burgun-marion-flip7/server/stats.php');
            const data = await response.json();
            if (data.status === 'OK') {
                ui.renderStatistiques(data.data);
                openModal('modal-stats');
            } else {
                ui.renderError("Erreur Base de données", data.message);
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
            ui.renderError("Serveur injoignable", "Impossible de contacter stats.php");
        }
    }

    async function saveGameStats(gameState) {
        const formData = new URLSearchParams();
        const regexPHP = /^_?[A-Z](-?[a-z0-9]+)*$/u;
        
        gameState.players.forEach((p, index) => {
            let pseudoClean = p.pseudo;
            if (pseudoClean.includes(" (Bot)")) {
                pseudoClean = pseudoClean.replace(" (Bot)", "");
            }
            
            if (regexPHP.test(pseudoClean)) {
                formData.append(pseudoClean, gameState.scores[index]);
            }
        });
        
        let nbJoueursValides = 0;
        for (let key of formData.keys()) nbJoueursValides++;

        if (nbJoueursValides > 1) {
            try {
                const response = await fetch('/burgun-marion-flip7/server/stats.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
                const result = await response.json();
                console.log("Sauvegarde des stats :", result);
            } catch (error) {
                ui.renderError("Erreur lors de la sauvegarde", error)
                console.error("Erreur lors de la sauvegarde :", error);
            }
        } else {
            console.log("Partie non sauvegardée : moins de 2 joueurs valides.");
        }
    }

    setState(STATES.HOME);

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.theme-btn')) ui.toggleTheme();
        if (e.target.closest('.btn-rules')) openModal('modal-rules');
        if (e.target.closest('.stats-btn')) {
            openModal('modal-stats');
            getStatistique();
        }
        if (e.target.closest('.quit-btn') && game && !game.getState().gameOver) {
            console.log('coucou');
            playerWantToQuit = game.getCurrentPlayer();
            if (playerWantToQuit instanceof HumanPlayer) {
                isGamePaused = true;
                openModal('modal-confirm-quit');
            }
        }
        if (e.target.closest('#btn-confirm-quit')) {
            if (playerWantToQuit) {
                const niveauBot = Math.random() < 0.5 ? 1 : 2;
                const botRemplacant = new ComputerPlayer(playerWantToQuit.getPseudo() + " (bot)", niveauBot);
                
                game.replacePlayer(playerWantToQuit, botRemplacant);
                
                isGamePaused = false;
                

                let remainHuman = false;
                const allPlayers = game.getPlayers();
                for (let i = 0; i < allPlayers.length; i++) {
                    if (allPlayers[i] instanceof HumanPlayer) {
                        remainHuman = true;
                    }
                }
                if (!remainHuman) {
                    ui.renderState("Tous les joueurs ont abandonné ! Fin de la partie.");
                    saveGameStats(game.getState());
                    ui.renderEndScreen();
                    setState(STATES.ENDGAME);
                    closeModal('modal-confirm-quit');
                    return;
                }

                ui.renderState(`${playerWantToQuit.getPseudo()} abandonne et est remplacé par un Bot !`);
                playerWantToQuit = null;
                
                if (game.getCurrentPlayer() === botRemplacant && !lockButton) {
                    playNextTurnIfBot();
                }
            }
            closeModal('modal-confirm-quit');
        }

        if (e.target.closest('#btn-cancel-quit')) {
            playerWantToQuit = null;
            isGamePaused = false;
            closeModal('modal-confirm-quit');
        }
        if (e.target.closest('.play-btn') && players.length >= 2) {
            const instancedPlayers = players.map(player => {
                if(player.type === 'bot') return new ComputerPlayer(player.pseudo, 1);
                if(player.type === 'bot_hard') return new ComputerPlayer(player.pseudo, 2);
                return new HumanPlayer(player.pseudo);
            });
            game = new Game(instancedPlayers);
            ui.setGame(game);
            game.start();
            ui.renderGameHeader();
            setState(STATES.GAME);
            ui.renderState("Le jeu commence. Cliquez sur Tirer pour jouer.");
            playNextTurnIfBot();
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
        
        for (let i = 0; i < players.length; i++) {
            if (players[i].pseudo === pseudo) {
                ui.renderError('Pseudo déjà utilisé', 'Ce pseudo est déjà utilisé, trouve en un autre...');
                return; 
            }
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
            players.push({pseudo: `${pseudo}`, type: "player"});
        } else if(selectPlayerType === '1') {
            players.push({pseudo: `${pseudo}`, type: "bot"});
        } else if(selectPlayerType === '2') {
            players.push({pseudo: `${pseudo}`, type: "bot_hard"});
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
        if(e.key === 'd' || e.key === 'D' && document.querySelector("input:focus") !== document.querySelector("input[name='pseudo']")) {
            ui.toggleTheme();
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
            status.innerHTML = 'Bot Difficile';
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

    /**
     * Partie du jeu
     */
    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function playNextTurnIfBot() {
        const currentPlayer = game.getCurrentPlayer();
        if (currentPlayer instanceof ComputerPlayer && !game.getState().gameOver) {
            document.getElementById('hit-btn').disabled = true;
            document.getElementById('stop-btn').disabled = true;
            try {
                await wait(2300);
                const choix = currentPlayer.makeDecision(game);
                handleAction(choix, { tirer: document.getElementById('hit-btn'), stop: document.getElementById('stop-btn') });
            } catch(error) {
                ui.renderError("Une erreur est survenue...","Le bot à planté.");
            }
        }
    }

    async function demanderCibleAuJoueur(playerlist, triggeringPlayer) {
        let joueurQuiChoisit = triggeringPlayer || game.getCurrentPlayer();

        if (joueurQuiChoisit instanceof ComputerPlayer) {
            let indexChoisi = await joueurQuiChoisit.getIndexPlayerList(playerlist);
            return playerlist[indexChoisi];
        } else {
            return await ui.askPlayerToSelectTarget(playerlist);
        }
    }

    async function handleAction(action, button) {

        if(lockButton) return;
        lockButton = true;

        const playerWhoplayed = game.getCurrentPlayer();

        button.tirer.disabled = true;
        button.stop.disabled = true;

        try {

            const miseAJourEcran = (joueurCible) => {
                if (joueurCible) {
                    ui.renderState(`Distribution de cartes à ${joueurCible.getPseudo()}...`);
                } else {
                    ui.renderState();
                }
            };

            const result = await game.playAction(action, miseAJourEcran, demanderCibleAuJoueur);
            
            let msg = "";
            let turnEnded = false;

            switch (result.status) {
                case "continue": msg = "Carte tirée. Au joueur suivant."; turnEnded = true; break;
                case "secondChanceCard": ui.renderSecondeChance(playerWhoplayed.getPseudo()); turnEnded = true; break;
                case "flip7": ui.renderFlip7Event(playerWhoplayed.getPseudo()); turnEnded = true; break;
                case "duplicate": ui.renderBustScreen(playerWhoplayed.getPseudo()); turnEnded = true; break;
                case "stopped": msg = playerWhoplayed.getPseudo() + " s'est arrêté (Stop)."; turnEnded = true; break;
                case "stopCard": ui.renderStopEvent(playerWhoplayed.getPseudo(), result.playergivencard?.getPseudo()); turnEnded = true; break;
                case "troisAlaSuite": ui.renderTroisALaSuiteEvent(playerWhoplayed.getPseudo(), result.player?.getPseudo()); turnEnded = true; break;
                case "empty": msg = "Le deck est vide. Pioche mélangée, tirez à nouveau."; turnEnded = false; break;
                case "givencard": msg = "Carte donnée à " + (result.player?.getPseudo?.() || "la pile") + ". À vous de tirer !"; turnEnded = false; break;
                case "chance": ui.renderSecondeChance(playerWhoplayed.getPseudo()); turnEnded = false; break;
                default: msg = "";
            }

            ui.renderStateForPlayer(playerWhoplayed, msg);

            if (turnEnded || !game.checkCanPlayAll()) {
                
                await wait(2300);

                while (isGamePaused) await wait(200);

                const turnResult = game.endTurn();
                

                if (turnResult.status === 'newRound') {
                    ui.renderNextManche(game.getState().round);
                    ui.renderState("Nouveau round ! Toutes les mains ont été remises à la pile.");
                } else {
                    ui.renderNextPlayer();
                    ui.renderState("Au tour de " + game.getCurrentPlayer().getPseudo());
                }

                playNextTurnIfBot();

            } else {
                ui.renderStateForPlayer(playerWhoplayed, msg);
                playNextTurnIfBot(); 
            }

            if (game.getState().gameOver) {
                saveGameStats(game.getState());
                ui.renderEndScreen();
                setState(STATES.ENDGAME);
            }
        } catch (error) {
            ui.renderError("Une erreur est survenue...", "Erreur lors de l'action.");
        } finally {
            lockButton = false;
            if (!game.getState().gameOver && !(game.getCurrentPlayer() instanceof ComputerPlayer)) {
                button.tirer.disabled = false;
                button.stop.disabled = false;
            }
        }
    }

    document.getElementById('hit-btn').addEventListener("click", function(){
        if(game.getCurrentPlayer() instanceof ComputerPlayer) return;
        handleAction("T", { tirer: document.getElementById('hit-btn'), stop: document.getElementById('stop-btn') });
    });

    document.getElementById('stop-btn').addEventListener("click", function(){
        if(game.getCurrentPlayer() instanceof ComputerPlayer) return;
        handleAction("S", { tirer: document.getElementById('hit-btn'), stop: document.getElementById('stop-btn') });
    });

});