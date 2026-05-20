
import { Board } from "./Board.js";
import { ComputerPlayer, HumanPlayer } from "./Player.js";

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    let numberOfPlayersInput = document.getElementById("number-of-players");
    numberOfPlayersInput.value = sessionStorage.getItem("numberOfPlayers") || 2;
    
    const btnStart = document.getElementById("btn-start");
    
    btnStart.addEventListener("click",async function () { 
        numberOfPlayersInput = document.getElementById("number-of-players");
        localStorage.setItem("numberOfPlayers", numberOfPlayersInput.value);
        sessionStorage.setItem("numberOfPlayers", numberOfPlayersInput.value);
        btnStart.disabled = true;
        const players = [];
        let numberOfPlayers = parseInt(numberOfPlayersInput.value) || 2;
        if(numberOfPlayers < 2 || numberOfPlayers > 6){
            numberOfPlayers = 2;
        }
        for (let i = 0; i < numberOfPlayers; i++) {
            //players.push(new HumanPlayer("Player " + (i + 1)));
            players.push(new ComputerPlayer("Bot " + (i + 1),1));
        }
        

        const board = new Board(players);
        board.start();

        const handArea = document.getElementById("handarea");
        for(let i = 0; i < players.length; i++){
            const playerHandArea = document.createElement("div");
            playerHandArea.id = "hand-area-" + i;
            const title = document.createElement("h2");
            title.textContent = `${players[i].getPseudo()} - Votre main ${players[i].getCanPlay() ? "(En jeu)" : "(Tour terminé)"}`;
            title.id = "hand-title-" + i;
            const handList = document.createElement("ul");
            handList.id = "hand-list-" + i;
            handList.innerHTML = "<li>Aucune carte</li>";
            playerHandArea.appendChild(title);
            playerHandArea.appendChild(handList);
            handArea.appendChild(playerHandArea);
        }

        const currentPlayerEl = document.getElementById("current-player");
        const deckCountEl = document.getElementById("deck-count");
        const roundEl = document.getElementById("round");
        const scoresEl = document.getElementById("scores");
        const messageEl = document.getElementById("message");
        const btnTirer = document.getElementById("btn-tirer");
        const btnStop = document.getElementById("btn-stoper");

        

        function renderHand(player, all = false) {
            if(all) {
                for(let i = 0; i < board.getPlayers().length; i++){
                    let p = board.getPlayers()[i];
                    renderHand(p);
                }
                return;
            }

            const handListEl = document.getElementById("hand-list-" + players.indexOf(player));
            const handListTitleEl = document.getElementById("hand-title-" + players.indexOf(player));
            handListEl.innerHTML = "";
            handListTitleEl.innerHTML = `${player.getPseudo()} - Votre main ${player.getCanPlay() ? "(En jeu)" : "(Tour terminé)"}`;

            if (player.getHand().length === 0) {
                handListEl.innerHTML = "<li>Aucune carte</li>";
                return;
            }
            for (const card of player.getHand()) {
                const li = document.createElement("li");
                li.textContent = `${card.getNumero()} ${card.getNom()}`;
                handListEl.appendChild(li);
            }
        }

        function renderState(message = "") {
            const state = board.getState();
            currentPlayerEl.textContent = `Joueur actif : ${state.currentPlayerPseudo}`;
            deckCountEl.textContent = `Cartes restantes : ${state.deckCount}`;
            roundEl.textContent = `Round : ${state.round}`;
            scoresEl.textContent = `Scores : ${state.scores.map((score, i) => `${players[i].getPseudo()}: ${score}`).join(', ')}`;
            messageEl.textContent = message;

            for (let i = 0; i < players.length; i++) {
                const titleEl = document.getElementById(`hand-title-${i}`);
                if (!titleEl) continue;
                titleEl.style.color = (i === state.currentPlayerIndex) ? 'cyan' : '';
            }
        }

        function endGame(message) {
            messageEl.textContent = message;
            btnTirer.disabled = true;
            btnStop.disabled = true;
        }

        async function handleAction(action, button) {
            const playerWhoplayed = board.getCurrentPlayer();

            if(board.getCurrentPlayer() instanceof ComputerPlayer){
                button.tirer.disabled = true;
                button.stop.disabled = true;
                
            }else{
                button.tirer.disabled = false;
                button.stop.disabled = false;
            }

            try {
                const result = await board.playAction(action, renderHand);
                switch (result.status) {
                    case "continue":
                        renderState("Carte tirée. Continuez ou stoppez.");
                        renderHand(playerWhoplayed);
                        break;
                    case "flip7":
                        renderState("Flip 7 de " + playerWhoplayed.getPseudo() + " ! Tour terminé.");
                        renderHand(playerWhoplayed);
                        break;
                    case "stopCard":
                        if (result?.roundReset) {
                            renderState("Le tour de " + (result?.playergivencard ? result.playergivencard.getPseudo() : playerWhoplayed.getPseudo()) + " a été arrêté." + "Nouveau round ! Toutes les mains ont été remises à jour.");
                            renderHand(null, true);
                            break;
                        }
                        renderState("Le tour de " + (result?.playergivencard ? result.playergivencard.getPseudo() : playerWhoplayed.getPseudo()) + " a été arrêté.");
                        result?.playergivencard ? renderHand(result.playergivencard) : null;
                        break;
                    case "troisAlaSuite":
                        renderState(playerWhoplayed.getPseudo() + " a joué TROIS A LA SUITE sur " + result.player.getPseudo() + " !");
                        renderHand(playerWhoplayed);
                        renderHand(result.player);
                        break;
                    case "duplicate":
                        renderState("Carte " + result.card.getNom() + " déjà présente. Tour terminé.");
                        renderHand(playerWhoplayed);
                        break;
                    case "duplicateSpeciale":
                        renderState("Carte spéciale déjà présente. Choisissez un joueur a qui la donner.");
                        renderHand(playerWhoplayed);
                        break;
                    case "empty":
                        renderState("Le deck est vide. Deck reshufflé vous pouvez tirer une carte.");
                        renderHand(playerWhoplayed);
                        break;
                    case "stopped":
                        renderState("Tour arrêté. Joueur suivant.");
                        renderHand(playerWhoplayed);
                        break;
                    case "givencard":
                        renderState("Carte " + result.card.getNom() + " donnée à " + (result.player.getPseudo?.() || "la pile") + ".");
                        renderHand(playerWhoplayed);
                        result?.playergivencard ? renderHand(result.playergivencard) : null;
                        break;
                    case "chance":
                        renderState("Seconde Chance utilisée! Vous pouvez continuer à tirer ou stopper.");
                        renderHand(playerWhoplayed);
                        break;
                    case "secondChanceCard":
                        renderState("Vous avez récupéré une carte Seconde Chance ! Elle vous protégera si vous sautez.");
                        renderHand(playerWhoplayed);
                        break;
                    case "newRound":
                        renderState("Nouveau round ! Toutes les mains ont été remises à jour.");
                        renderHand(null, true);
                        break;
                    default:
                        renderState("");
                        renderHand(playerWhoplayed);
                }

                if (board.getState().gameOver) {
                    endGame(`Le jeu est terminé. ${board.getState().playerWin.getPseudo()} a gagné !`);
                }
            } catch (error) {
                console.error("Erreur lors de l'action:", error);
                renderState("Une erreur est survenue.");
            } finally {
                // Re-enable buttons if game is not over
                if (!board.getState().gameOver) {
                    button.tirer.disabled = false;
                    button.stop.disabled = false;
                }
            }
        }
        

        let button = {};
        button.tirer = btnTirer;
        button.stop = btnStop;

        btnTirer.addEventListener("click", function () {
            handleAction("T", button);
        });

        btnStop.addEventListener("click", function () {
            handleAction("S", button);
        });

        renderState("Le jeu commence. Cliquez sur Tirer pour jouer.");

        if(board.getCurrentPlayer() instanceof ComputerPlayer){
            const choix = board.getCurrentPlayer().makeDecision();
            await new Promise(r => setTimeout(r, 800));
            handleAction(choix, button);
        }
    });
});