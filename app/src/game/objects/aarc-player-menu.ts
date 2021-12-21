// aarc-player-menu.ts - use this class for each players personal menu

import { AarcPlayer, AarcButton, AarcIcon } from 'game/objects';
import { BUTTON_BG_SELECTED, BUTTON_BG_HOVERED, BUTTON_BG_NOT_SELECTED, ICON_ATTACK, ICON_SPECIAL, ICON_ITEMBAG, BLACK_CIRCLE_SHADED } from 'game/assets';
import { getRelative } from "game/helpers";
import { AA_Attack } from './actions';
import { AA_Special_ETH } from './actions';
import { AA_003_MK2_Grenade } from './actions';
import { AA_116_Coconut } from './actions';
import { AARC_ICON_IMAGE_DEPTH } from './object-depths';
import { reduceEachTrailingCommentRange } from 'typescript';
import { aAAVE, aDAI, aETH, aLINK, aTUSD, aUNI, aUSDC, aUSDT, aYFI } from 'game/assets';
import { timeStamp } from 'console';

// getCollateralKey() returns the aToken phaser key for a given collateral address
const getCollateralKey = (collateral: string): string => {
    switch (collateral) {
        case '0x823cd4264c1b951c9209ad0deaea9988fe8429bf': { return aAAVE; break;}
        case '0xe0b22e0037b130a9f56bbb537684e6fa18192341': { return aDAI; break;}
        case '0x20d3922b4a1a8560e1ac99fba4fade0c849e2142': { return aETH; break;}
        case '0x98ea609569bd25119707451ef982b90e3eb719cd': { return aLINK; break;}
        case '0xf4b8888427b00d7caf21654408b7cba2ecf4ebd9': { return aTUSD; break;}
        case '0x8c8bdbe9cee455732525086264a4bf9cf821c498': { return aUNI; break;}
        case '0x9719d867a500ef117cc201206b8ab51e794d3f82': { return aUSDC; break;}
        case '0xdae5f1590db13e3b40423b5b5c5fbf175515910b': { return aUSDT; break;}
        case '0xe20f7d1f0ec39c4d5db01f53554f2ef54c71f613': { return aYFI; break;}
        default: { break; }
    }
    return '';
}

// define our class
export class AarcPlayerMenu {
    // define our base scene and player objects
    private scene;
    private player;
    private visible = false;

    // define attack, special and item icons
    private attackIcon: AarcIcon;
    private specialIcon: AarcIcon;
    private itemIconLH: AarcIcon;
    private itemIconRH: AarcIcon;

    // define the constructor
    constructor(scene: Phaser.Scene, player: AarcPlayer) {
        this.scene = scene;
        this.player = player;

        // create all the menu icons, start by choosing a radius to make them
        const ICON_RADIUS = this.player.displayWidth*.25;
        
        // create an attack icon for the player    
        this.attackIcon = new AarcIcon ({
            scene: this.scene,
            x: this.player.x - this.player.displayWidth*.34,
            y: this.player.y + this.player.displayHeight*.75,
            radius: ICON_RADIUS,
            keyBg: BLACK_CIRCLE_SHADED,
            keyIcon: ICON_ATTACK,
        })
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => this.attackButtonClicked())
        .on('pointerover', () => this.attackButtonOver())
        .on('pointerout', () => this.attackButtonOut())
        .setVisible(this.visible)
        .setDepth(AARC_ICON_IMAGE_DEPTH);

        // create a special icon for the player
        const c = this.player.gotchi ? getCollateralKey(this.player.gotchi?.collateral) : ICON_SPECIAL;

        this.specialIcon = new AarcIcon ({
            scene: this.scene,
            x: this.player.x + this.player.displayWidth*.34,
            y: this.player.y + this.player.displayHeight*.75,
            radius: ICON_RADIUS,
            keyBg: BLACK_CIRCLE_SHADED,
            keyIcon: c,
            iconToCircleRatio: 0.95,
        })
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => this.specialButtonClicked())
        .on('pointerover', () => this.specialButtonOver())
        .on('pointerout', () => this.specialButtonOut())
        .setVisible(this.visible)
        .setDepth(AARC_ICON_IMAGE_DEPTH);
        
        // create LEFT hand (right side of screen) item icon
        let wearableLHstr = '';
        if (this.player.gotchi) {
            const ew = this.player.gotchi.equippedWearables[5];
            if (ew !== 0) {
                wearableLHstr = 'wearable-' + (ew.toString()).padStart(3, '0');
            } else {
                wearableLHstr = ICON_ITEMBAG;
            }
        } 
        this.itemIconLH = new AarcIcon ({
            scene: this.scene,
            x: this.player.x + this.player.displayWidth*.75,
            y: this.player.y + this.player.displayHeight*.21,
            radius: ICON_RADIUS,
            keyBg: BLACK_CIRCLE_SHADED,
            // key: wearableLHstr,
            keyIcon: 'wearable-116',    // this is temporary until code all items
            useBadge: true,
            numBadge: this.player.getStat('ITEMS_LH'),
        })
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => this.itemLHbuttonClicked())
        .on('pointerover', () => this.itemLHbuttonOver())
        .on('pointerout', () => this.itemLHbuttonOut())
        .setVisible(this.visible)
        .setDepth(AARC_ICON_IMAGE_DEPTH);

        // create RIGHT hand (left side of screen) item icon
        let wearableRHstr = '';
        if (this.player.gotchi) {
            const ew = this.player.gotchi.equippedWearables[4];
            if (ew !== 0) {
                wearableRHstr = 'wearable-' + (ew.toString()).padStart(3, '0');
            } else {
                wearableRHstr = ICON_ITEMBAG;
            }
        } 
        // console.log('wearable string: ' + wearableRHstr);
        this.itemIconRH = new AarcIcon ({
            scene: this.scene,
            x: this.player.x - this.player.displayWidth*.75,
            y: this.player.y + this.player.displayHeight*.21,
            radius: ICON_RADIUS,
            keyBg: BLACK_CIRCLE_SHADED,
            // key: wearableRHstr,
            keyIcon: 'wearable-003',
            useBadge: true,
            numBadge: this.player.getStat('ITEMS_RH'),
        })
        .setInteractive({cursor: 'pointer'})
        .on('pointerdown', () => this.itemRHbuttonClicked())
        .on('pointerover', () => this.itemRHbuttonOver())
        .on('pointerout', () => this.itemRHbuttonOut())
        .setVisible(this.visible)
        .setDepth(AARC_ICON_IMAGE_DEPTH);

        // set initial look of all items
        this.attackIcon.setLooksEnabled(true);
        this.specialIcon.setLooksEnabled(this.player.getStat('SPECIAL_CURRENT') >= this.player.getStat('SPECIAL_MAX'));
        this.itemIconLH.setLooksEnabled(this.player.getStat('ITEMS_LH') > 0);
        this.itemIconRH.setLooksEnabled(this.player.getStat('ITEMS_RH') > 0);

    }

    public update() {
        this.attackIcon.setPosition(
            this.player.x - this.player.displayWidth*.34,
            this.player.y + this.player.displayHeight*.75);
        
        this.specialIcon.setPosition(
            this.player.x + this.player.displayWidth*.34,
            this.player.y + this.player.displayHeight*.75);
        
        this.itemIconLH.setPosition(
            this.player.x + this.player.displayWidth*.75,
            this.player.y + this.player.displayHeight*.21);
        
        this.itemIconRH.setPosition(
            this.player.x - this.player.displayWidth*.75,
            this.player.y + this.player.displayHeight*.21);

    }

    // define the attack button pointer functions
    private attackButtonClicked = () => {
        // always start a clicked button function by ensuring we have
        // destroyed the old action and have a fresh one ready to go
        if (this.player.action) this.player.action.destroy();
        this.player.action = 0;

        // toggle our button as required
        if (!this.attackIcon.isSelected()) {
            // select the attack icon
            this.attackIcon.setSelected(true);
            // make an attack action and start aiming (be careful! making new action sets aiming to false)
            this.player.action = new AA_Attack(this.scene, this.player);
            this.player.action.aim(true);
            // show message
            this.player.speechBubble.setText('ATTACK TIME! WHO TO TARGET?')
            // now lets change cursor to target
            this.scene.input.setDefaultCursor(this.player.action.getAimingCursor());
        } else {
            // deselect attack icon
            this.attackIcon.setSelected(false);
            // show message
            this.player.speechBubble.setText('DEFENSE READY!');
            // if we deselect switch to default icon
            this.scene.input.setDefaultCursor('default');
        }

        this.specialIcon.setSelected(false);
        this.itemIconLH.setSelected(false);
        this.itemIconRH.setSelected(false);
    }

    private attackButtonOver = () => {
        if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
            this.attackIcon.setHovered(true);
            this.player.speechBubble.setText('ATTACK?');
            
        }      
    }

    private attackButtonOut = () => {
        if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
            this.attackIcon.setHovered(false);
            this.player.speechBubble.setText('DEFENSE READY!');
            
        } 
    }

    // define the special button pointer functions
    private specialButtonClicked = () => {
        // first check our player has enough special to use this button
        if (this.player.getStat('SPECIAL_CURRENT') >= this.player.getStat('SPECIAL_MAX')) {
            // always start a clicked button function by ensuring we have
            // destroyed the old action and have a fresh one ready to go
            if (this.player.action) this.player.action.destroy();
            this.player.action = 0;

            this.attackIcon.setSelected(false);

            // toggle our button as required
            if (!this.specialIcon.isSelected()) {
                this.specialIcon.setSelected(true);
                this.player.speechBubble.setText('SPECIAL TIME! WHO TO TARGET?')
                // insert new special action below this just before aim()
                this.player.action = new AA_Special_ETH(this.scene, this.player);
                this.player.action.aim(true);
                // now lets change cursor to target
                this.scene.input.setDefaultCursor(this.player.action.getAimingCursor());
            } else {
                this.specialIcon.setSelected(false);
                this.player.speechBubble.setText('DEFENSE READY!');
                // if we deselect switch to default icon
                this.scene.input.setDefaultCursor('default');
            }

            this.itemIconLH.setSelected(false);
            this.itemIconRH.setSelected(false);
        }
        
    }

    private specialButtonOver = () => {
        // first check our player has enough special to use this button
        if (this.player.getStat('SPECIAL_CURRENT') >= this.player.getStat('SPECIAL_MAX')) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
                this.specialIcon.setHovered(true);
                this.player.speechBubble.setText('USE SPECIAL?');
            }
        }
    }

    private specialButtonOut = () => {
        // first check our player has enough special to use this button
        if (this.player.getStat('SPECIAL_CURRENT') >= this.player.getStat('SPECIAL_MAX')) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
                this.specialIcon.setHovered(false);
                this.player.speechBubble.setText('DEFENSE READY!');
            }
        }
    }

    // define the item button pointer functions
    private itemLHbuttonClicked = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_LH') > 0) {
            // always start a clicked button function by ensuring we have
            // destroyed the old action and have a fresh one ready to go
            if (this.player.action) this.player.action.destroy();
            this.player.action = 0;

            this.attackIcon.setSelected(false);
            this.specialIcon.setSelected(false);

            // toggle our button as required
            if (!this.itemIconLH.isSelected()) {
                this.itemIconLH.setSelected(true);
                this.player.speechBubble.setText('LEFT HAND ITEM SELECTED! WHO TO TARGET?')
                // insert new item action below this just before aim()
                this.player.action = new AA_116_Coconut (this.scene, this.player);
                this.player.action.aim(true);
                // now lets change cursor to target
                this.scene.input.setDefaultCursor(this.player.action.getAimingCursor());
            } else {
                this.itemIconLH.setSelected(false);
                this.player.speechBubble.setText('DEFENSE READY!');
                // if we deselect switch to default icon
                this.scene.input.setDefaultCursor('default');
            }

            this.itemIconRH.setSelected(false);
        }
    }

    private itemLHbuttonOver = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_LH') > 0) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
                this.itemIconLH.setHovered(true);
                this.player.speechBubble.setText('USE LEFT HAND ITEM?');
            }
        }
    }

    private itemLHbuttonOut = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_LH') > 0) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
                this.itemIconLH.setHovered(false);
                this.player.speechBubble.setText('DEFENSE READY!');
            }
        }
    }

    // define the item button pointer functions
    private itemRHbuttonClicked = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_RH') > 0) {
            // always start a clicked button function by ensuring we have
            // destroyed the old action and have a fresh one ready to go
            if (this.player.action) this.player.action.destroy();
            this.player.action = 0;

            this.attackIcon.setSelected(false);
            this.specialIcon.setSelected(false);
            this.itemIconLH.setSelected(false);
    
            // toggle our button as required
            if (!this.itemIconRH.isSelected()) {
                this.itemIconRH.setSelected(true);
                this.player.speechBubble.setText('RIGHT HAND ITEM SELECTED! WHO TO TARGET?')
                // insert new item action below this just before aim()
                this.player.action = new AA_003_MK2_Grenade (this.scene, this.player);
                this.player.action.aim(true);
                // now lets change cursor to target
                this.scene.input.setDefaultCursor(this.player.action.getAimingCursor());
            } else {
                this.itemIconRH.setSelected(false);
                this.player.speechBubble.setText('DEFENSE READY!');
                // if we deselect switch to default icon
                this.scene.input.setDefaultCursor('default');
            }
        }
    }

    private itemRHbuttonOver = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_RH') > 0) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
            this.itemIconRH.setHovered(true);
            this.player.speechBubble.setText('USE RIGHT HAND ITEM?');
            }
        }
    }

    private itemRHbuttonOut = () => {
        // first check if our player has enough items left to use this
        if (this.player.getStat('ITEMS_RH') > 0) {
            if (!this.attackIcon.isSelected() && !this.specialIcon.isSelected() && !this.itemIconLH.isSelected() && !this.itemIconRH.isSelected()) {
                this.itemIconRH.setHovered(false);
                this.player.speechBubble.setText('DEFENSE READY!');
            }
        }
    }

    // basic function to deslect all icons
    public deselectAllButtons() {
        // deselect all
        this.attackIcon.setSelected(false);
        this.specialIcon.setSelected(false);
        this.itemIconLH.setSelected(false);
        this.itemIconRH.setSelected(false);
    }


    // define set and get visible functions
    public setVisible = (visible: boolean) => {
        this.visible = visible;
        this.attackIcon.setVisible(visible);
        this.specialIcon.setVisible(visible);
        this.itemIconLH.setVisible(visible);
        this.itemIconRH.setVisible(visible);

        // if player has enough special make the special icon look enabled
        this.specialIcon.setLooksEnabled(this.player.getStat('SPECIAL_CURRENT') >= this.player.getStat('SPECIAL_MAX'));

        // whenever icons visible update the badge numbers
       if (visible) {
           const numLH = this.player.getStat('ITEMS_LH');
           const numRH = this.player.getStat('ITEMS_RH');
           this.itemIconLH.setBadge(this.player.getStat('ITEMS_LH'));
           this.itemIconRH.setBadge(this.player.getStat('ITEMS_RH'));
           if (numLH <= 0) this.itemIconLH.setLooksEnabled(false);
           if (numRH <= 0) this.itemIconRH.setLooksEnabled(false);
       }
    }

    public getVisible = () => { return this.visible; }


    

}