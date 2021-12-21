// aarc-statbar.ts - main stat bar for aarc
import { STAT_BAR_GREEN, STAT_BAR_BLUE, STAT_BAR_RED, STAT_BAR_BG } from 'game/assets';
import { getRelative } from 'game/helpers';
import { AarcPlayer } from './aarc-player';

interface Props {
    scene: Phaser.Scene;
    player: AarcPlayer;
    // x: number;
    // y: number;
    // key: string;
    frame?: number;
}

// size our stat bar based off these 3 basic values
const pad = 8;
const h = 60;  // height of overall box
const w = 250;  // width of overall box
const ratio = 0.4; // This is the percent size of hp bar the special bar is

export class AarcStatBar extends Phaser.GameObjects.Sprite {

    // define private members
    private hpbar: any;
    private hpTracker = 0;
    // private maxHP = 100;
    private textHP: any;
    private changeTextHP = false;
    private setInitialTextHP = false;

    private specialbar: any;

    private player: AarcPlayer;
    
    // call the constructor
    constructor({ scene, player}: Props) {
        super(scene,0,0, STAT_BAR_BG);
        this.player = player;
        
        this.scene.add.existing(this);

        // create origin of the stat bar
        this.setOrigin(0,0);     
        this.displayWidth = getRelative(w, this.scene);
        this.displayHeight = getRelative(h,this.scene);
        this.alpha = 0.5;

        // create the hp bar
        this.hpbar = this.scene.add.image(
            this.x + getRelative(w/3+pad/2, this.scene),
            this.y + getRelative(pad, this.scene),
            STAT_BAR_GREEN)
            .setOrigin(0,0)
            .setDisplaySize(getRelative(w*2/3-2*pad,this.scene), getRelative(h*(1-ratio)-1.5*pad, this.scene));
        
        // create the special bar
        this.specialbar = this.scene.add.image(
            this.x + getRelative(w/3+pad/2, this.scene),
            this.y + getRelative(h*(1-ratio)+pad/2, this.scene),
            STAT_BAR_BLUE)
            .setOrigin(0,0)
            .setDisplaySize(0, getRelative(h*ratio-1.5*pad, this.scene));
        
        // set overall position of the statbar
        this.setPosition(
            this.player.x-this.displayWidth/2, 
            this.player.y-this.player.displayHeight/2 - this.displayHeight);
    
    }

    // call update
    public update(): void {

        //console.log('statbar update calling?')
        if (!this.setInitialTextHP) {
            
            let fontHeight = (w/3-1.5*pad)/3/.486;
            if (fontHeight > (h - 2*pad)) {
                fontHeight = h-2*pad;
            }

            this.textHP = this.scene.add.text(
                this.x + getRelative(w/3/2,this.scene),
                this.y + getRelative(h/2, this.scene),
                this.player.getStat('HP_CURRENT').toString())
                .setOrigin(0.5,0.5)
                .setStyle({
                    fontSize: getRelative(fontHeight*.9,this.scene).toString() + 'px',
                    fontFamily: 'Comic Sans MS',
                    color: '#ffffff',
                    align: 'center',
                });

            this.setInitialTextHP = true;
        }

        // change hp bar colour if we're below 50% health
        const hpCurrent = this.player.getStat('HP_CURRENT');
        const hpMax = this.player.getStat('HP_MAX');
        if (hpCurrent < hpMax/2) this.hpbar.setTexture(STAT_BAR_RED);
        if (hpCurrent > hpMax/2) this.hpbar.setTexture(STAT_BAR_GREEN);

        // update stat bar to be positioned relative to player
        this.setPosition(
            this.player.x-this.displayWidth/2 - (this.displayWidth-this.displayWidth)/2,
            this.player.y-this.player.displayHeight/2 - this.displayHeight);
    
    }

    // define adjustHP function
    public adjustHP = (delta: number): void => {
      
        if (this.setInitialTextHP) {

            this.hpTracker = this.player.getStat('HP_CURRENT');
            const targetHP = this.hpTracker + Math.floor(delta);

            this.scene.tweens.add({
                targets: this,
                hpTracker: targetHP,
                duration: 750,
                onUpdate: () => {
                    this.textHP.setText(Math.floor(this.hpTracker).toString());
                    if (targetHP <= 0) this.textHP.setText('0');
                }
            });

            const targetDisplayWidth = getRelative(w*2/3-2*pad,this.scene)*targetHP/this.player.getStat('HP_MAX');

            this.scene.tweens.add({
                targets: this.hpbar,
                displayWidth: targetDisplayWidth,
                duration: 750,
            });
            
        }
    }

    public adjustSpecial = (delta: number): void => {
        const p = this.player;

        const targetSpecial = 
            (p.getStat('SPECIAL_CURRENT') + delta) >= p.getStat('SPECIAL_MAX') ? 
            p.getStat('SPECIAL_MAX') : p.getStat('SPECIAL_CURRENT') + delta;

        const targetDisplayWidth = getRelative(w*2/3-2*pad,this.scene)*targetSpecial/p.getStat('SPECIAL_MAX');

        this.scene.tweens.add({
            targets: this.specialbar,
            displayWidth: targetDisplayWidth,
            duration: 750,
        });

        
    }

    public setPosition(x: number, y: number) {
        super.setPosition(x,y);
        
        if (this.hpbar) this.hpbar.setPosition(
            this.x + getRelative(w/3+pad/2, this.scene),
            this.y + getRelative(pad, this.scene)
        );

        if (this.specialbar) this.specialbar.setPosition(
            this.x + getRelative(w/3+pad/2, this.scene),
            this.y + getRelative(h*(1-ratio)+pad/2, this.scene)
        );

        if (this.textHP) this.textHP.setPosition(this.x + getRelative(w/3/2,this.scene),
            this.y + getRelative(h/2, this.scene),);

        return this;
    }

    public setVisible(value: boolean) {
        super.setVisible(value);
        this.hpbar.setVisible(value);
        this.specialbar.setVisible(value);
        this.textHP.setVisible(value);
        return this;
    }
}