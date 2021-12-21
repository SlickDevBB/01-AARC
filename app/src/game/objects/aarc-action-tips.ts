// aarc-action-tips.ts
// this object will provide a toggled dialogue at bottom of screen that shows
// what specific actions, specials, items etc. do

import { AarcPlayer } from "./aarc-player";
import { STAT_BAR_BG, BUTTON_SQUARE_BLACK } from 'game/assets';
import { getRelative, getGameHeight, getGameWidth } from "game/helpers";




export class AarcActionTips {
    private scene: Phaser.Scene;
    private players: AarcPlayer[];
    private opponents: AarcPlayer[];
    private boxBg: Phaser.GameObjects.Image;
    private displayText: Phaser.GameObjects.Text;
    private playerNames: string[] = [];
    private playerActions: string[] = [];

    // call the constructor
    constructor(scene: Phaser.Scene, 
                players: AarcPlayer[], 
                opponents: AarcPlayer[]) {
        this.scene = scene;
        this.players = players;
        this.opponents = opponents;

        // create a background 
        this.boxBg = scene.add.image(
            getGameWidth(this.scene)*0.33,
            getGameHeight(this.scene),
            BUTTON_SQUARE_BLACK,
            )
            .setOrigin(0,1)
            .setDisplaySize(getGameWidth(this.scene)*0.33, getGameHeight(this.scene)*0.15)
            .setVisible(true)
            .setAlpha(0.7);

        
        this.displayText = this.scene.add.text(
            getGameWidth(this.scene)*0.33,
            getGameHeight(this.scene)*0.85,
            'THIS IS WHERE YOU GET ADDITIONAL TIPS FOR ACTIONS YOU SELECT ON GOTCHIS')
            .setOrigin(0,0)
            .setStyle({
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'left',
            })
            .setDepth(1000)
            .setWordWrapWidth(getGameWidth(this.scene)*0.33)
            .setPadding(10,10,10,10);
        
    }

    public setVisible(visible: boolean) {
        this.boxBg.setVisible(visible);
        this.displayText.setVisible(visible);
    }
}