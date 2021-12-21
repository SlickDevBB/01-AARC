// helpers.ts - helper functions for actions
import Phaser from 'phaser';
import { AarcPlayer } from "../aarc-player";

export function hitText(scene: Phaser.Scene, actor: AarcPlayer, target: AarcPlayer,
    text: string, fadeTime = 1000) {

    // add a text object 
    const statChangeText = scene.add.text(
        target.x,
        target.y-target.displayHeight*0.5,
          text,)
          .setVisible(true)
          .setStyle({
              fontFamily: 'Arial', 
              fontSize: Math.trunc(target.displayHeight*0.5).toString() + 'px', 
            })
          .setOrigin(0.5,0.5)
          .setStroke('0x000000', 3);
  
    // store target movement location for the text
    const targetY = target.y - target.displayHeight*2.5;

    // add tween that moves text up and across in sin pattern
    scene.tweens.add({
        targets: statChangeText,
        y: targetY,
        alpha: 0,
        duration: fadeTime,
    });
}