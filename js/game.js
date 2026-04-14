
import {Board} from "./Board.js";
import {HumanPlayer, Player} from "./Player.js";

document.addEventListener("DOMContentLoaded", function(){
    let player = []
    for(let i = 0; i < 5; i++){
        player.push(new HumanPlayer("Player " + (i+1)));
    }
    let b = new Board(player);
    b.start();
});