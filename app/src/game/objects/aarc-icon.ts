// aarc-icon.ts - these are the action icons around a gotchi

import { BLACK_CIRCLE_SHADED, WHITE_CIRCLE_SHADED } from 'game/assets';
import { AARC_ICON_BACKGROUND_DEPTH } from './object-depths';

interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    keyBg: string;
    keyIcon: string;
    frame?: number;
    radius: number;
    useBadge?: boolean;
    numBadge?: number;
    iconToCircleRatio?: number;
}

const HOVER_SCALE_UP = 1.33;
const ALPHA = 0.75;

export class AarcIcon extends Phaser.GameObjects.Image {
    // declare private variables
    private icon: Phaser.GameObjects.Image;
    private selected = false;
    private initRadius = 0;
    private initHeight = 0;
    private initWidth = 0;
    private badgeBG: Phaser.GameObjects.Arc | 0;
    private badgeText: Phaser.GameObjects.Text | 0;
    private iconToCircleRatio = 0.6;

    constructor({ scene, x, y, keyBg, keyIcon, frame, radius, useBadge = false, numBadge = 0, iconToCircleRatio = 0.6} : Props) {
        super(scene, x, y, keyBg, frame);
        
        // save the initial specified radius for later
        this.initRadius = radius;

        // set icon to circle ratio
        this.iconToCircleRatio = iconToCircleRatio;

        // set depth, alpha and display size
        this.setAlpha(ALPHA);
        this.setDepth(AARC_ICON_BACKGROUND_DEPTH);
        this.setDisplaySize(2*radius, 2*radius);

        // add the icon itself to the scene
        this.scene.add.existing(this);

        // get the very first width and height
        this.initHeight = this.displayHeight;
        this.initWidth = this.displayWidth;

        // now create our icon image
        this.icon = this.scene.add.image(x, y, keyIcon);
        this.icon.displayHeight = 2*radius*this.iconToCircleRatio;
        this.icon.displayWidth = this.icon.displayHeight * (this.initWidth/this.initHeight);
        this.icon.setDepth(AARC_ICON_BACKGROUND_DEPTH+1);

        // add a badge if set to true in constructor
        if (useBadge) {
            this.badgeBG = this.scene.add.circle(
                this.x + radius*.7,
                this.y + radius*.7,
                radius*0.5,
                0xff0000,
                ALPHA)
                .setDepth(AARC_ICON_BACKGROUND_DEPTH+1)
                .setOrigin(0.5,0.5);
            this.badgeText = this.scene.add.text(this.x, this.y, numBadge.toString())
                .setOrigin(0.5,0.5)
                .setDepth(AARC_ICON_BACKGROUND_DEPTH+2)
                .setStyle({
                    fontSize: (radius*.8).toString() + 'px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    align: 'center',
                });
        } else {
            this.badgeBG = 0;
            this.badgeText = 0;
        }

    }

    public setVisible(value: boolean): this {
        super.setVisible(value);
        this.icon.setVisible(value);
        if (this.badgeBG) this.badgeBG.setVisible(value);
        if (this.badgeText) this.badgeText.setVisible(value);

        return this;
    }

    public setLooksEnabled(looksEnabled: boolean) {
        if (looksEnabled) {
            this.setAlpha(ALPHA);
            this.icon.setAlpha(1);
            if (this.badgeBG) this.badgeBG.setAlpha(ALPHA);
            if (this.badgeText) this.badgeText.setAlpha(1);
        } else {
            this.setAlpha(ALPHA*0.35);
            this.icon.setAlpha(0.35);
            if (this.badgeBG) this.badgeBG.setAlpha(ALPHA*0.35);
            if (this.badgeText) this.badgeText.setAlpha(0.35);
        }
    }

    public setSelected = (selected: boolean) => {
        this.selected = selected;

        // if selected, change bg
        if (selected) {
            this.setTexture(WHITE_CIRCLE_SHADED);
            this.icon.displayHeight = 2*this.initRadius*this.iconToCircleRatio*HOVER_SCALE_UP;
            this.icon.displayWidth = this.icon.displayHeight * (this.initWidth/this.initHeight);
            this.setDisplaySize(2*this.initRadius*HOVER_SCALE_UP,2*this.initRadius*HOVER_SCALE_UP);
        } else {
            this.setTexture(BLACK_CIRCLE_SHADED);
            this.icon.displayHeight = 2*this.initRadius*this.iconToCircleRatio;
            this.icon.displayWidth = this.icon.displayHeight * (this.initWidth/this.initHeight);
            this.setDisplaySize(2*this.initRadius, 2*this.initRadius);
        }  
    }

    public isSelected = () => { return this.selected; }

    public setHovered(hovered: boolean) {
        if (hovered) {
            this.icon.displayHeight = 2*this.initRadius*this.iconToCircleRatio*HOVER_SCALE_UP;
            this.icon.displayWidth = this.icon.displayHeight * (this.initWidth/this.initHeight);
            this.setDisplaySize(2*this.initRadius*HOVER_SCALE_UP,2*this.initRadius*HOVER_SCALE_UP);
        } else {
            this.icon.displayHeight = 2*this.initRadius*this.iconToCircleRatio;
            this.icon.displayWidth = this.icon.displayHeight * (this.initWidth/this.initHeight);
            this.setDisplaySize(2*this.initRadius,2*this.initRadius);
        }
    }

    public setPosition(x: number, y: number) {
        super.setPosition(x,y);
        if (this.icon) this.icon.setPosition(x,y);
        if (this.badgeBG) this.badgeBG.setPosition(x+this.initRadius*.7,y+this.initRadius*.7);
        if (this.badgeText) this.badgeText.setPosition(x+this.initRadius*.7,y+this.initRadius*.7);
        return this;
    }

    // define function to change badge number
    public setBadge(value: number) {
        if (this.badgeText) this.badgeText.text = Math.trunc(value).toString()
    }

}