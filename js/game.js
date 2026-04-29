
import {Board} from "./Board.js";
import {HumanPlayer} from "./Player.js";

document.addEventListener("DOMContentLoaded", function(){
    console.log("DOM fully loaded and parsed");
    const players = [];
    for (let i = 0; i < 5; i++) {
        players.push(new HumanPlayer("Player " + (i + 1)));
    }

    const board = new Board(players);
    board.start();

    const currentPlayerEl = document.getElementById("current-player");
    const deckCountEl = document.getElementById("deck-count");
    const roundEl = document.getElementById("round");
    const scoresEl = document.getElementById("scores");
    const handListEl = document.getElementById("hand-list");
    const messageEl = document.getElementById("message");
    const btnTirer = document.getElementById("btn-tirer");
    const btnStop = document.getElementById("btn-stoper");

    function renderHand(player){
        handListEl.innerHTML = "";
        if(player.getHand().length === 0){
            handListEl.innerHTML = "<li>Aucune carte</li>";
            return;
        }
        for (const card of player.getHand()){
            const li = document.createElement("li");
            li.textContent = `${card.getNumero()} ${card.getNom()}`;
            handListEl.appendChild(li);
        }
    }

    function renderState(message = ""){
        const state = board.getState();
        currentPlayerEl.textContent = `Joueur actif : ${state.currentPlayerPseudo}`;
        deckCountEl.textContent = `Cartes restantes : ${state.deckCount}`;
        roundEl.textContent = `Round : ${state.round}`;
        scoresEl.textContent = `Scores : ${state.scores.map((score, i) => `${players[i].getPseudo()}: ${score}`).join(', ')}`;
        messageEl.textContent = message;
        renderHand(board.getCurrentPlayer());
    }

    function endGame(message){
        messageEl.textContent = message;
        btnTirer.disabled = true;
        btnStop.disabled = true;
    }

    function handleAction(action){
        const result = board.playAction(action);
        switch(result.status){
            case "continue":
                renderState("Carte tirée. Continuez ou stoppez.");
                break;
            case "flip7":
                renderState("Flip 7 ! Tour terminé.");
                break;
            case "duplicate":
                renderState("Carte déjà présente. Tour terminé.");
                break;
            case "empty":
                renderState("Le deck est vide. Deck reshufflé vous pouvez tirer une carte.");           
                break;
            case "stopped":
                renderState("Tour arrêté. Joueur suivant.");
                break;
            default:
                renderState("");
        }

        if(board.getState().gameOver){
            endGame("Le jeu est terminé.");
        }
    }

    btnTirer.addEventListener("click", function(){
        handleAction("T");
    });

    btnStop.addEventListener("click", function(){
        handleAction("S");
    });

    renderState("Le jeu commence. Cliquez sur Tirer pour jouer.");
});