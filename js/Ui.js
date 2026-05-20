import { Game } from "./game.js";
import { ComputerPlayer } from './Player.js';
import { Card, NumberCard, BonusCard, SpecialCard } from "./Cards.js";

const DICTIONNAIRE_FICHIERS_CARTES = {
    '+2': 'plus2',
    '+4': 'plus4',
    '+6': 'plus6',
    '+8': 'plus8',
    '+10': 'plus10',
    'x2': 'fois2',
    'SECONDECHANCE': 'seconde_chance',
    'TROISALASUITE': 'trois_a_la_suite',
    'STOP': 'stop'
};

export class Ui {

    #game

    #HTML_ELEMENT = {
        currentPlayerEl: document.getElementById("current-player"),
        deckCountEl: document.getElementById("deck-count"),
        roundEl: document.getElementById("round"),
        scoresEl: document.getElementById("scores"),
        messageEl: document.getElementById("message"),
        btnTirer: document.getElementById("hit-btn"),
        btnStop: document.getElementById("stop-btn")
    }

    constructor(game = null) {
        this.#game = game;
    }

    setGame(game) {
        this.#game = game;
    }


    updatePlayButton(playerCount) {
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.disabled = playerCount < 3;
        });
    }


    updateAddPlayerButton(playerCount) {
        document.querySelectorAll('.add-player-btn').forEach(btn => {
            btn.disabled = playerCount > 4;
        });
    }

    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    initTheme() {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }

    initBackground() {
        fetch('assets/images/bg-pattern.svg')
            .then(r => r.text())
            .then(svg => {
                document.querySelector('.bg-pattern').innerHTML = svg;
            });
    }

    initLogo() {
        fetch('assets/images/logo-flip7.svg')
            .then(r => r.text())
            .then(svg => {
                document.getElementById('logo-flip7').innerHTML = svg;
            });
    }

    renderNavbar(idView) {
        let selectedView = document.getElementById(idView);
        selectedView.innerHTML += `<div class="nav-container">
            <svg class="arch" xmlns="http://www.w3.org/2000/svg" width="100%" height="141" viewBox="0 0 1440 141" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M-1.31135e-05 136.484C-0.000122476 88.7447 -0.000177157 64.8752 14.6017 49.5274C29.2036 34.1796 53.0434 32.9913 100.723 30.6148L714.952 0L1339.2 30.6811C1386.92 33.0261 1410.77 34.1986 1425.39 49.549C1440 64.8994 1440 88.784 1440 136.553L1440 142.208H0L-1.31135e-05 136.484Z" fill="var(--element-bg)"/>
            </svg>
            <div class="buttons">
                <button class="secondary-btn btn-rules">
                    <svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37" fill="none">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0404 3.08337H24.9611C29.7233 3.08337 32.375 5.82754 32.375 10.5296V26.455C32.375 31.2342 29.7233 33.9167 24.9611 33.9167H12.0404C7.35375 33.9167 4.625 31.2342 4.625 26.455V10.5296C4.625 5.82754 7.35375 3.08337 12.0404 3.08337ZM12.4567 10.2675V10.2521H17.0647C17.7292 10.2521 18.2688 10.7917 18.2688 11.4531C18.2688 12.133 17.7292 12.6725 17.0647 12.6725H12.4567C11.7922 12.6725 11.2542 12.133 11.2542 11.47C11.2542 10.8071 11.7922 10.2675 12.4567 10.2675ZM12.4567 19.6409H24.5433C25.2062 19.6409 25.7458 19.1013 25.7458 18.4384C25.7458 17.7755 25.2062 17.2343 24.5433 17.2343H12.4567C11.7922 17.2343 11.2542 17.7755 11.2542 18.4384C11.2542 19.1013 11.7922 19.6409 12.4567 19.6409ZM12.4567 26.6863H24.5433C25.1585 26.6246 25.6225 26.0989 25.6225 25.4838C25.6225 24.8517 25.1585 24.3275 24.5433 24.2659H12.4567C11.9942 24.2196 11.5471 24.4355 11.3004 24.8363C11.0538 25.2217 11.0538 25.7305 11.3004 26.1313C11.5471 26.5167 11.9942 26.748 12.4567 26.6863Z" fill="var(--secondary-btn-color)"/>
                    </svg>
                    Règles
                </button>
                <button class="primary-btn play-btn" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22" fill="none">
                        <path d="M17.2552 12.7764C17.1539 12.8803 16.7717 13.3246 16.4156 13.6901C14.3281 15.9888 8.88241 19.7513 6.03215 20.8998C5.59929 21.0843 4.50491 21.4749 3.9202 21.5C3.35992 21.5 2.82582 21.371 2.31616 21.1094C1.68083 20.7439 1.17117 20.1688 0.891906 19.4897C0.712129 19.0185 0.432862 17.6085 0.432862 17.5834C0.153596 16.0408 0 13.5342 0 10.7643C0 8.12521 0.153596 5.72079 0.382245 4.15487C0.408427 4.12979 0.687693 2.37754 0.99314 1.77733C1.55342 0.680833 2.64779 0 3.81896 0H3.9202C4.68294 0.026875 6.28698 0.707708 6.28698 0.732792C8.98364 1.88304 14.3037 5.461 16.4418 7.83854C16.4418 7.83854 17.044 8.4495 17.3058 8.83112C17.7142 9.37937 17.9167 10.0584 17.9167 10.7375C17.9167 11.4953 17.688 12.2013 17.2552 12.7764Z" fill="#02090E"/>
                    </svg>
                    Jouer
                </button>
                <button class="secondary-btn stats-btn">
                    <svg width="34" height="33" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.513432 32.1638H9.8803C10.1223 32.1638 10.2433 32.1638 10.3185 32.0886C10.3937 32.0134 10.3937 31.8924 10.3937 31.6504V20.4709C10.3937 19.8584 10.3937 19.5522 10.2035 19.3619C10.0132 19.1717 9.70697 19.1717 9.09451 19.1717H7.7953C4.12056 19.1717 2.28319 19.1717 1.14159 20.3133C0 21.4549 0 23.2922 0 26.967V31.6504C0 31.8924 0 32.0134 0.0751905 32.0886C0.150381 32.1638 0.271398 32.1638 0.513432 32.1638Z" fill="var(--secondary-btn-color)"/>
                        <path d="M12.2127 32.1637H21.5671C21.8121 32.1637 21.9346 32.1637 22.0107 32.0876C22.0868 32.0115 22.0868 31.889 22.0868 31.644V17.8724C22.0868 15.4225 22.0868 14.1976 21.3257 13.4366C20.5646 12.6755 19.3397 12.6755 16.8899 12.6755C14.4401 12.6755 13.2152 12.6755 12.4541 13.4366C11.693 14.1976 11.693 15.4225 11.693 17.8724V31.644C11.693 31.889 11.693 32.0115 11.7691 32.0876C11.8453 32.1637 11.9677 32.1637 12.2127 32.1637Z" fill="var(--secondary-btn-color)"/>
                        <path d="M23.9058 32.1638H33.2926C33.5062 32.1638 33.6129 32.1638 33.6848 32.1049C33.698 32.0941 33.71 32.082 33.7208 32.0688C33.7798 31.997 33.7798 31.8902 33.7798 31.6766C33.7798 28.4733 33.7798 26.8716 32.8951 25.7935C32.7331 25.5962 32.5522 25.4152 32.3548 25.2533C31.2768 24.3685 29.6751 24.3685 26.4717 24.3685H24.6853C24.0728 24.3685 23.7666 24.3685 23.5764 24.5588C23.3861 24.7491 23.3861 25.0553 23.3861 25.6677V31.6441C23.3861 31.8891 23.3861 32.0116 23.4622 32.0877C23.5383 32.1638 23.6608 32.1638 23.9058 32.1638Z" fill="var(--secondary-btn-color)"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5646 5.63203C21.3981 4.99536 21.8149 4.67702 21.922 4.41954C22.1225 3.93765 21.9345 3.38181 21.4827 3.12054C21.2413 2.98094 20.7093 2.98094 19.6455 2.98094C19.3601 2.98094 19.2175 2.98094 19.0936 2.95003C18.8274 2.88363 18.5982 2.71467 18.4561 2.48C18.39 2.37079 18.3483 2.23621 18.265 1.96705C17.9592 0.978666 17.8063 0.484474 17.6223 0.301816C17.217 -0.100638 16.5629 -0.100601 16.1576 0.301901C15.9736 0.48458 15.8208 0.978719 15.5151 1.967C15.4319 2.23611 15.3903 2.37066 15.3241 2.47988C15.182 2.71462 14.9528 2.88363 14.6866 2.95004C14.5627 2.98094 14.42 2.98094 14.1347 2.98094C13.0704 2.98094 12.5382 2.98094 12.2967 3.12063C11.8451 3.38191 11.6571 3.93757 11.8575 4.41937C11.9646 4.67696 12.3815 4.99541 13.2153 5.6323L13.3337 5.7227C13.575 5.90699 13.6956 5.99913 13.78 6.10954C13.9259 6.30042 14.0012 6.53596 13.993 6.77609C13.9883 6.91498 13.9435 7.06001 13.8538 7.35007L13.7931 7.54632C13.505 8.47839 13.3609 8.94443 13.4034 9.19011C13.5018 9.75999 14.0465 10.1399 14.6153 10.0355C14.8605 9.99047 15.2481 9.69432 16.0233 9.10202C16.2477 8.93059 16.3599 8.84487 16.4765 8.79431C16.7402 8.68005 17.0394 8.68004 17.3031 8.79428C17.4197 8.84483 17.5319 8.93054 17.7563 9.10196C18.5318 9.69435 18.9195 9.99055 19.1648 10.0355C19.7335 10.1399 20.2781 9.75992 20.3765 9.19008C20.419 8.94436 20.2748 8.47824 19.9865 7.54599L19.9259 7.35012C19.8362 7.06007 19.7914 6.91505 19.7866 6.77617C19.7784 6.53599 19.8537 6.30039 19.9997 6.10947C20.0841 5.99908 20.2047 5.90693 20.446 5.72265L20.5646 5.63203Z" fill="var(--secondary-btn-color)"/>
                    </svg>
                    Stats
                </button>
            </div>
        </div>   
        `;
    }

    renderWaitroom(players) {
        let waitroomCounter = document.getElementById('player-cnt');
        waitroomCounter.innerHTML = `${players.length}/${Game.MAX_PLAYERS_LIMIT} joueurs`;

        let waitroomList = document.getElementById('added-players');
        waitroomList.innerHTML = '';
        players.forEach((player, index) => {
            console.log(player.pseudo);
            waitroomList.innerHTML += `
            <div class="player" data-index="${index}">
                <p class="pseudo">${player.pseudo}</p>
                <button class="primary-btn delete-player">x</button>
                <p class="player-type">${player.type}</p>
            </div>
            `
        })

    }

    renderError(title, message) {
        let divError = document.createElement('div');
        divError.className = "error-div";
        divError.innerHTML = `
        <p class="error-title">${title}</p>
        <p class="error-message">${message}</p>
        `;
        document.body.appendChild(divError);

        setTimeout(() => {
            divError.classList.add('slide-out-left');
            setTimeout(() => {
                divError.remove();
            }, 400); 
        }, 3000);
    }

    renderGameHeader() {
        document.getElementById('buttons-bar').innerHTML += `
            <button class="primary-btn quit-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 21" fill="none">
                    <path d="M10.2001 20.0133C14.7301 20.0133 18.6501 17.1033 19.9601 12.7733C20.0701 12.4233 19.9701 12.0333 19.7101 11.7733C19.4501 11.5133 19.0701 11.4133 18.7101 11.5233C17.9301 11.7533 17.1301 11.8733 16.3301 11.8733C11.8101 11.8733 8.13006 8.19327 8.13006 3.67327C8.13006 2.87327 8.25006 2.07327 8.48006 1.29327C8.53282 1.11958 8.53742 0.934829 8.49335 0.758738C8.44928 0.582647 8.3582 0.421834 8.22985 0.293479C8.10149 0.165124 7.94068 0.0740469 7.76459 0.0299776C7.5885 -0.0140916 7.40374 -0.009498 7.23006 0.043268C5.13369 0.676313 3.29765 1.96911 1.99501 3.7294C0.692361 5.48968 -0.00730837 7.62342 5.75689e-05 9.81327C5.75689e-05 15.4333 4.58006 20.0133 10.2001 20.0133Z" fill="var(--secondary-btn-color)"/>
                </svg>
            </button>
        `;
    }

    clearGameHeader() {
        document.querySelector('.quit-btn')?.remove();
    }

    createCard(card, isFaceUp = true, className) {
        let imgCard = document.createElement('img');
        imgCard.className = className;
        imgCard.src = this.getCardFileName(card, isFaceUp);

        imgCard.dataset.value = isFaceUp ? (card instanceof NumberCard ? card.getNumero() : card.getNom()): "back-card";

        return imgCard;

    }

    getCardFileName(card, isFaceUp) {
        if(!isFaceUp) {
            return "assets/sprites/back.webp";
        }
        if(card instanceof NumberCard) {
            return `assets/sprites/${card.getNumero()}.webp`;
        }
        return `assets/sprites/${DICTIONNAIRE_FICHIERS_CARTES[card.getNom()]}.webp`;
    }

    clearHand() {
        document.getElementById('number-card-container').innerHTML = '';
        document.getElementById('special-card-container').innerHTML = '';
        document.getElementById('bonus-card-container').innerHTML = '';
    }

    renderHand(tableauCartes) {
        this.clearHand();
        const containerNumber = document.getElementById('number-card-container');
        const containerSpecial = document.getElementById('special-card-container');
        const containerBonus = document.getElementById('bonus-card-container');

        for (let card of tableauCartes) {
            let imgCard = this.createCard(card, true, 'hand-card');
            if(card instanceof NumberCard) {
                const randomAngle = Math.floor(Math.random() * 10) - 5;
                const randomPosY = Math.floor(Math.random() * 6) -3;

                imgCard.classList.add('number-card');
                imgCard.style.transform = `rotate(${randomAngle}deg) translateY(${randomPosY}px)`;
                containerNumber.appendChild(imgCard);
            } else if(card instanceof SpecialCard) {

                imgCard.classList.add('special-card');
                imgCard.style.transform = "rotate(2deg)";
                containerSpecial.appendChild(imgCard);
            } else if(card instanceof BonusCard) {

                imgCard.classList.add('bonus-card');
                containerBonus.appendChild(imgCard);
            }
        }
    }

    clearDraw() {
        let drawContainer = document.getElementById('draw-container');
        drawContainer.innerHTML = '';
    }

    renderDrawPile(deck) {
        this.clearDraw();
        const drawContainer = document.getElementById('draw-container');

        if(deck.length === 0) {
            drawContainer.innerHTML = '<div id="empty-draw">Pioche vide</div>';
            return;
        }

        const visibleCards = deck.slice(-5);

        visibleCards.forEach((card, index) => {
            const cardImg = this.createCard(card, false, 'draw-card');

            cardImg.style.position = "absolute";
            cardImg.style.top = `${-index*2}px`;
            cardImg.style.left = `${index*1}px`;

            drawContainer.appendChild(cardImg);
        });  
    }

    clearDiscard() {
        let discardContainer = document.getElementById('discard-container');
        discardContainer.innerHTML = '';
    }

    renderDiscardPile(pile) {
        this.clearDiscard();
        const discardContainer = document.getElementById('discard-container');

        if(pile.length === 0) {
            discardContainer.innerHTML = '<div id="empty-discard">Pile vide</div>';
            return;
        }

        const visibleCards = pile.slice(-5);

        visibleCards.forEach((card, index) => {
            const cardImg = this.createCard(card, true, 'discard-card');

            cardImg.style.position = "absolute";
            cardImg.style.top = `${-index*2}px`;
            cardImg.style.left = `${index*1}px`;
            const randomAngle = Math.floor(Math.random() * 10) - 5;
            cardImg.style.transform = `rotate(${randomAngle}deg)`;

            discardContainer.appendChild(cardImg);
        });  
    }

renderPlayer(player) {
    console.log(player.getPseudo(), player.getHand());
    const state = this.#game.getState();
    const playerIndex = this.#game.getPlayers().indexOf(player);
    const score = state.scores[playerIndex];
    const isCurrentPlayer = player === this.#game.getCurrentPlayer();
    let playerInfo = document.createElement('div');

    const cardsSection = document.createElement('div');
    cardsSection.className = 'hand-cards';
    for (const card of player.getHand()) {
        const img = this.createCard(card, true, 'card-mini');
        cardsSection.appendChild(img);
    }

    if (isCurrentPlayer) {
        playerInfo.className = 'current-player-info';
        playerInfo.innerHTML = `
            <div class="player-name">
                <span class="pseudo">${player.getPseudo()}</span>
                <span class="player-type">${player instanceof ComputerPlayer ? 'Bot' : 'Joueur'}</span>
            </div>
            <div class="player-score">${score}</div>
        `;
    } else if (!player.getCanPlay()) {
        playerInfo.className = 'inactive-player-info';
        const scoreInfo = player.getSaute()
            ? `<span class="bust-label">BUST</span>`
            : `${score}`;
        playerInfo.innerHTML = `
            <div class="player-name">
                <span class="pseudo">${player.getPseudo()}</span>
                <span class="player-type">${player instanceof ComputerPlayer ? 'Bot' : 'Joueur'}</span>
            </div>
            <div class="player-score">${scoreInfo}</div>
        `;
    } else {
        playerInfo.className = 'ingame-player-info';
        playerInfo.innerHTML = `
            <div class="player-name">
                <span class="pseudo">${player.getPseudo()}</span>
                <span class="player-type">${player instanceof ComputerPlayer ? 'Bot' : 'Joueur'}</span>
            </div>
            <div class="player-score">${score}</div>
        `;
    }

    if (!isCurrentPlayer) {
        playerInfo.insertBefore(cardsSection, playerInfo.querySelector('.player-score'));
    }

    return playerInfo;
}

renderPlayersList() {
    const activeListEl = document.getElementById('active-player-list');
    const inactiveListEl = document.getElementById('inactive-player-list');

    activeListEl.innerHTML = '';
    inactiveListEl.innerHTML = '';

    for (const player of this.#game.getPlayers()) {
        const el = this.renderPlayer(player);
        if (player === this.#game.getCurrentPlayer()) {
            activeListEl.prepend(el); 
        } else if (player.getCanPlay()) {
            activeListEl.appendChild(el);
        } else {
            inactiveListEl.appendChild(el);
        }
    }
}

    renderNextTurn() {

    }

    renderBustScreen() {

    }

    renderNextPlayer() {
        const div = document.createElement('div');
        div.innerHTML = `<p>Au tour de ${this.#game.getCurrentPlayer().getPseudo()}</p>`;
        div.classList.add('next-player-overlay');
        document.body.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 2000);
    }

    renderCurrentPlayer() {
        let currentPlayer = document.getElementById('current-player');
        currentPlayer.innerHTML = `<p>Joueur:</p><p id="player-name">${this.#game.getCurrentPlayer().getPseudo()}</p>`;
    }

    renderEventCardModal(message) {

    }

    renderRoundInfos() {

    }

    renderEndScreen() {

    }

    renderFlip7Event() {

    }

    renderTroisALaSuiteEvent() {

    }

    renderSecondeChance() {

    }

    renderStopEvent() {

    }

    renderChoosePlayerEffect() {

    }

    renderChoosePlayerGiveCard() {
        
    }

    renderStatistiques(arrayStats) {
        const statistiques = document.getElementById('modal-stats');
        statistiques.innerHTML = "";
    }

    renderState(message = ""){
        const state = this.#game.getState();
        this.#HTML_ELEMENT.currentPlayerEl.textContent = `Joueur actif : ${state.currentPlayerPseudo}`;
        this.#HTML_ELEMENT.deckCountEl.textContent = `Cartes restantes : ${state.deckCount}`;
        this.#HTML_ELEMENT.roundEl.textContent = `Round : ${state.round}`;
        this.#HTML_ELEMENT.scoresEl.textContent = `Scores : ${state.scores.map((score, i) => `${this.#game.getPlayers()[i].getPseudo()}: ${score}`).join(', ')}`;
        this.#HTML_ELEMENT.messageEl.textContent = message;
        this.renderDrawPile(this.#game.getDeck());
        this.renderHand(this.#game.getCurrentPlayer().getHand());
        this.renderCurrentPlayer();
        this.renderPlayersList();
    }


    endGame(message){
        this.#HTML_ELEMENT.messageEl.textContent = message;
        this.#HTML_ELEMENT.btnTirer.disabled = true;
        this.#HTML_ELEMENT.btnStop.disabled = true;
    }

}

