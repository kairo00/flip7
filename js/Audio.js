export class AudioManage {
    constructor() {
        this.sounds = {
            click_1: new Audio('./assets/sounds/click_1.mp3'),
            victory: new Audio('./assets/sounds/victory.mp3'),
            flip_card: new Audio('./assets/sounds/flip_card.mp3'),
            flip_7: new Audio('./assets/sounds/flip_7.mp3')
        }
    }

    play(sound) {
        if (this.muted) return;
        if(this.sounds[sound]) {
            this.sounds[sound].currentTime = 0;
            this.sounds[sound].play().catch(e => console.log('Erreur: Son bloqué'));
        }
    }
}