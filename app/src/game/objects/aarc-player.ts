import { getGameHeight, getGameWidth, getRelative } from "game/helpers";
import { AarcStatBar, AarcButton, AarcPlayerMenu, AarcHighlightRing,} from "game/objects";
import { AarcActionBaseClass } from "game/objects/actions/aarc-action-base-class"
import {AARC_PLAYER_DEPTH } from 'game/objects/object-depths';

import {
  STAT_BAR_BG, PARTICLE_BLUE, PARTICLE_RED, SPEECH_BUBBLE,
} from 'game/assets';

// Import aarc trait interface and the calc functions from AarcTraitsPanel (just so they're all in the same place)
import { AarcTraits, calculateAarcTraits } from "components/AarcTraitsPanel";
import { AavegotchiGameObject } from "types";
import { AA_Attack } from "./actions";
import { GameScene } from "game/scenes/game-scene";
import { timeStamp } from "console";
import { isJSDocThisTag } from "typescript";
import { AarcSpeech } from "./aarc-speech";

interface Props {
  scene: Phaser.Scene;
  gotchi: AavegotchiGameObject | undefined;
  x: number;
  y: number;
  key: string;
  frame?: number;
}

// make player selection enum
enum SelectEnum {
  NOT_SELECTED,
  POTENTIAL_SELECTION,
  SELECTED,
}

// make an enum for targeting
enum TargetEnum {
  NO_TARGETS,
  POTENTIAL_TARGETS_AGRO,
  POTENTIAL_TARGETS_FRIENDLY,
  SELECTED_TARGETS_AGRO,
  SELECTED_TARGETS_FRIENDLY,
}

export class AarcPlayer extends Phaser.GameObjects.Sprite {

  // declare the core gotchi object that this player is built off
  public gotchi : AavegotchiGameObject | undefined;

  // declare selection and targeting states
  private selectionState = SelectEnum.NOT_SELECTED;
  private targetingState = TargetEnum.NO_TARGETS;
  
  // define all of our private aarc stats
  private hpCurrent = 0;
  private hpMax = 0;
  private speed = 0;
  private evasion = 0;
  private attack = 0;
  private accuracy = 0;
  private specialRate = 0;  // note this special indicates how fast our special charges!
  private critical = 0;
  private itemsLH = 0;
  private itemsRH = 0;

  // define members to track our special meter
  private specialMax = 100;
  private specialCurrent = 0;

  // dead status
  private dead = false;

  // create our action object
  public action : AarcActionBaseClass | 0;

  // create a private statbar object
  private statbar: AarcStatBar;

  // create a private player menu
  private playerMenu: AarcPlayerMenu;

  // each player should have their own highlight rings when selected
  private highlightRing: AarcHighlightRing;

  // define a speech bubble
  public speechBubble: AarcSpeech;

  // set selection variables
  private selected = false;
  private potentialSelection = false;

  // define the selected functions
  public isSelected = () => { return this.selected; }
  public setSelected = (selected: boolean) => {
    this.selected = selected;
    // now update our buttons and highlights to reflect selection status
    this.playerMenu.setVisible(selected);
    this.speechBubble.setVisible(selected);
    // show the highlight emmitter
    if (selected) this.highlightRing.start().setAlpha(1);
    else this.highlightRing.stop();
    // need to set our action to visible/invisible
    if (this.action) this.action.setVisible(selected);
  }

  // if our player is potential selection we want to bring up his highlight rings
  public isPotentialSelection = () => { return this.potentialSelection; }
  public setPotentialSelection = (potentialSelection: boolean) => {
    this.potentialSelection = potentialSelection;
    if (potentialSelection) this.highlightRing.setAlpha(0.3).start();
    else this.highlightRing.setAlpha(0.3).stop();
  }

  public clearActionAndMenu() {
    if (this.action) this.action.destroy();
    this.action = 0;
    this.playerMenu.deselectAllButtons();
  }

  // define actionLocked vars/funcs
  public clearSelectionAndActions = () => {
    // hide the highlight and target emmitters
    this.highlightRing.stop();
    this.selected = false;
    this.potentialSelection = false;
    this.action = 0;
  }

  // call the constructor
  constructor({ scene, gotchi, x, y, key }: Props) {
    super(scene, x, y, key);

    // set the gotchi
    this.gotchi = gotchi ? gotchi : undefined;

    // sprite setup for our player
    this.setOrigin(0.5, 0.5);
    this.displayHeight = getRelative(175,this.scene);
    this.displayWidth = getRelative(175, this.scene);

    // Add animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers(key || '', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: 'enter',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [0] }),
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'dead',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [2, 3] }),
      frameRate: 1,
      repeat: -1,
    });

    this.play('enter');

    // add physics and the object to the scene
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    // add our custom stat bar
    this.statbar = new AarcStatBar({
      scene: this.scene, 
      player: this, });

    // create a highlight ring for the player and start it off stopped.
    this.highlightRing = new AarcHighlightRing(
      this.scene,
      PARTICLE_BLUE,
      this);
    this.highlightRing.stop();

    // set our initial aarc stats
    if (this.gotchi) this.setInitialStats(this.gotchi);

    // create our player menu
    this.playerMenu = new AarcPlayerMenu(this.scene, this);
    this.playerMenu.setVisible(false);

    // create a base class action (the player menu should assign children actions that give actual behaviour)
    this.action = new AarcActionBaseClass(this.scene, this);
    
    // create a speech bubble
    this.speechBubble = new AarcSpeech(
      this.scene, 
      this)
      .setVisible(false);

    // finally set our depth order
    this.setDepth(AARC_PLAYER_DEPTH);

    // console.log('');
    // if (this.gotchi) console.log('We just created: ' + this.gotchi.name);
    // if (this.gotchi) console.log('With wearables: ');
    // if (this.gotchi) console.log(this.gotchi.equippedWearables);
    // if (this.gotchi) console.log('and Collateral: ');
    // if (this.gotchi) console.log(this.gotchi.collateral);
  }

  public update(): void {
    // update the stat bar
    this.statbar.update();

    // update the speechBubble
    this.speechBubble.update();

    // update the player menu position
    this.playerMenu.update();

  }

  // roundEnd() gets called after every round once actions are complete
  public roundEnd() {
    if (!this.isDead()) {
      // we let the statbar adjust our players current special
      this.adjustStat('SPECIAL_CURRENT', this.specialRate);
      // reset our speech back to defense
      this.speechBubble.setText('DEFENSE READY!');
    }
  }

  public setInitialStats = (gotchi: AavegotchiGameObject) => {
    const at : AarcTraits = calculateAarcTraits(gotchi);
    this.hpCurrent = at.HP;
    this.hpMax = at.HP;
    this.speed = at.speed;
    this.evasion = at.evasion;
    this.attack = at.attack;
    this.accuracy = at.accuracy;
    this.specialRate = at.specialRate;
    this.critical = at.critical;
    this.itemsLH = at.items;
    this.itemsRH = at.items;

    // don't forget to initialise our stat bar
    //this.statbar.setInitialHP(this.hpCurrent);
    
  }

  // create a getStat function
  public getStat = (stat: 'HP_CURRENT' | 'HP_MAX' | 'SPEED' | 'EVASION' | 'ATTACK' |
  'ACCURACY' | 'SPECIAL_RATE' | 'SPECIAL_CURRENT' | 'SPECIAL_MAX' | 'CRITICAL' | 'ITEMS_LH' | 'ITEMS_RH') : number => {
    switch (stat) {
      case 'HP_CURRENT': { return this.hpCurrent; break; }
      case 'HP_MAX': { return this.hpMax; break; }
      case 'SPEED': { return this.speed; break; }
      case 'EVASION': { return this.evasion; break; }
      case 'ATTACK': { return this.attack; break; }
      case 'ACCURACY': { return this.accuracy; break; }
      case 'SPECIAL_CURRENT': { return this.specialCurrent; break; }
      case 'SPECIAL_RATE': { return this.specialRate; break; }
      case 'SPECIAL_MAX': { return this.specialMax; break; }
      case 'CRITICAL': { return this.critical; break; }
      case 'ITEMS_LH': { return this.itemsLH; break; }
      case 'ITEMS_RH': { return this.itemsRH; break; }
      default: { return 0; }
    }
  }

  // adjustStat is used to increase/decrease stats by a delta value
  public adjustStat = (stat: 'HP_CURRENT' | 'HP_MAX' | 'SPEED' | 'EVASION' | 'ATTACK' |
  'ACCURACY' | 'SPECIAL_CURRENT' | 'SPECIAL_RATE' | 'CRITICAL' | 'ITEMS_LH' | 'ITEMS_RH', delta: number) : void => {
    switch (stat) {
      case 'HP_CURRENT': { 
        if (this.hpCurrent + delta <= 0) {
          delta = -this.hpCurrent;
          this.setDead(true);
        }
        this.statbar.adjustHP(delta);
        this.hpCurrent += delta;
        break;
      }
      case 'HP_MAX': { this.hpMax += delta; break; }
      case 'SPEED': { this.speed += delta; break; }
      case 'EVASION': { this.evasion += delta; break; }
      case 'ATTACK': { this.attack += delta; break; }
      case 'ACCURACY': { this.accuracy += delta; break; }
      case 'SPECIAL_CURRENT': { 
        this.statbar.adjustSpecial(delta);
        this.specialCurrent += delta;
        this.specialCurrent = this.specialCurrent > this.specialMax ? this.specialMax : this.specialCurrent;
        break; 
      }
      case 'CRITICAL': { this.critical += delta; break; }
      case 'ITEMS_LH': { this.itemsLH += delta; break; }
      case 'ITEMS_RH': { this.itemsRH += delta; break; }
      default: { break;}
    }
    return;
  }

  // the set stat function should just call the adjust stat function
  public setStat = (stat: 'HP_CURRENT' | 'HP_MAX' | 'SPEED' | 'EVASION' | 'ATTACK' |
  'ACCURACY' | 'SPECIAL_CURRENT' | 'CRITICAL' | 'ITEMS_LH' | 'ITEMS_RH', value: number) : void => { 
    this.adjustStat(stat, value - this.getStat(stat));
  }

  // function for setting and getting menu visibility
  public setMenuVisible = (visible: boolean) => {
    this.playerMenu.setVisible(visible);
  }

  public getMenuVisible = () => { return this.playerMenu.getVisible(); }


  // set dead functions
  public setDead(dead: boolean) {
    // first and foremost set dead state to dead
    this.dead = dead;

    if (dead) {
      if (this.action) this.action.destroy();
      this.statbar.setVisible(false);
      this.anims.play('dead');
    } else {
      // this.setAlpha(1);
      this.statbar.setVisible(true);
      this.anims.play('idle');
    }
  }

  public isDead() { return this.dead; }


  public enterArena(targetX: number, targetY: number) {

    // tween the gotchis onto the screen
    this.scene.add.tween({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.play('idle');
      },
    });
  }

  public setStatBarVisible(visible: boolean) {
    this.statbar.setVisible(visible);
  }

  public setVisible(visible: boolean) {
    super.setVisible(visible);
    this.speechBubble.setVisible(visible);
    this.playerMenu.setVisible(visible);
    this.statbar.setVisible(visible);
    return this;
  }

}
