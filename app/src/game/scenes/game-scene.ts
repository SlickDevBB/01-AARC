import {
  LEFT_CHEVRON, BG, CLICK, STAT_BAR_BG,
  BUTTON_BG_HOVERED, BUTTON_BG_NOT_SELECTED, BUTTON_BG_SELECTED,
  BUTTON_RECTANGLE_BLUE, BUTTON_SQUARE_BLUE,
} from 'game/assets';
import { AavegotchiGameObject } from 'types';
import { getGameWidth, getGameHeight, getRelative, } from '../helpers';
import { AarcButton, AarcPlayer, AarcSelectionHandler, AarcRoundHandler } from 'game/objects';
import GrayScalePipeline from 'game/pipelines/GrayScale';
import { AA_Attack } from 'game/objects/actions';
import { AarcActionTips } from 'game/objects';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

/**
 * Scene where gameplay takes place
 */
export class GameScene extends Phaser.Scene {
  private selectedGotchiA?: AavegotchiGameObject;
  private selectedGotchiB?: AavegotchiGameObject;
  private selectedGotchiC?: AavegotchiGameObject;
  private randomGotchiA?: AavegotchiGameObject;
  private randomGotchiB?: AavegotchiGameObject;
  private randomGotchiC?: AavegotchiGameObject;
  private playerA?: AarcPlayer;
  private playerB?: AarcPlayer;
  private playerC?: AarcPlayer;
  public players?: AarcPlayer[];  // making this public so Aarc actions can access them

  private shifDeeA?: AarcPlayer;
  private shifDeeB?: AarcPlayer;
  private shifDeeC?: AarcPlayer;
  public shifDeez?: AarcPlayer[]; // making this public so Aarc actions can access them

  // make a dialog box
  public actionTips?: AarcActionTips;

  // define a selection handler
  private selectionHandler : AarcSelectionHandler | 0 = 0;

  // define a round handler
  private roundHandler: AarcRoundHandler | 0 = 0;

  // make an action confirmed button
  private actionConfirmed?: AarcButton;

  // make round button and counter
  private roundButton?: AarcButton;
  private roundCounter = 1;

  // onRoundComplete is a one time event emitter we create
  private onRoundComplete: Phaser.Events.EventEmitter | 0 = 0;

  // Sounds
  private back?: Phaser.Sound.BaseSound;

  // call the constructor
  constructor() {
    super(sceneConfig);
  }


  init = (data: { selectedGotchiA: AavegotchiGameObject,
                  selectedGotchiB: AavegotchiGameObject,
                  selectedGotchiC: AavegotchiGameObject,
                  randomGotchiA: AavegotchiGameObject, 
                  randomGotchiB: AavegotchiGameObject, 
                  randomGotchiC: AavegotchiGameObject, 
                }): void => {
    this.selectedGotchiA = data.selectedGotchiA;
    this.selectedGotchiB = data.selectedGotchiB;
    this.selectedGotchiC = data.selectedGotchiC;
    this.randomGotchiA = data.randomGotchiA;
    this.randomGotchiB = data.randomGotchiB;
    this.randomGotchiC = data.randomGotchiC;

    
  }

  public preload = (): void => {
    this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
  }


  public create(): void {
    // Add layout
    this.add.image(getGameWidth(this) / 2, getGameHeight(this) / 2, BG).setDisplaySize(getGameWidth(this), getGameHeight(this));
    this.back = this.sound.add(CLICK, { loop: false });
    this.createBackButton();

    // Add our 3 player gotchis
    this.playerA = new AarcPlayer({
      scene: this,
      gotchi: this.selectedGotchiA,
      x: getGameWidth(this)*.27-getGameWidth(this)/2,
      y: getGameHeight(this)*.37,
      key: this.selectedGotchiA?.spritesheetKey || '',
    });
    setTimeout(() => this.playerA?.enterArena(
      getGameWidth(this)*.27,
      getGameHeight(this)*.37), 
      0);

    this.playerB = new AarcPlayer({
      scene: this,
      gotchi: this.selectedGotchiB,
      x: getGameWidth(this)*.13-getGameWidth(this)/2,
      y: getGameHeight(this)*.6,
      key: this.selectedGotchiB?.spritesheetKey || '',
    });
    setTimeout(() => this.playerB?.enterArena(
      getGameWidth(this)*.13,
      getGameHeight(this)*.6), 
      200);

    this.playerC = new AarcPlayer({
      scene: this,
      gotchi: this.selectedGotchiC,
      x: getGameWidth(this)*.3-getGameWidth(this)/2,
      y: getGameHeight(this)*.83,
      key: this.selectedGotchiC?.spritesheetKey || '',
    });
    setTimeout(() => this.playerC?.enterArena(
      getGameWidth(this)*.3,
      getGameHeight(this)*.83), 
      400);

    // initialise the players array which will be useful later for map and filter
    this.players = [this.playerA, this.playerB, this.playerC];

    // create our shifDeez
    this.shifDeeA = new AarcPlayer({
      scene: this,
      gotchi: this.randomGotchiA,
      x: getGameWidth(this)*.7+getGameWidth(this)/2,
      y: getGameHeight(this)*.27,
      key: this.randomGotchiA?.spritesheetKey || '',
    });
    setTimeout(() => this.shifDeeA?.enterArena(
      getGameWidth(this)*.7,
      getGameHeight(this)*.27), 
      100);
    
    this.shifDeeB = new AarcPlayer({
      scene: this,
      gotchi: this.randomGotchiB,
      x: getGameWidth(this)*.87+getGameWidth(this)/2,
      y: getGameHeight(this)*.5,
      key: this.randomGotchiB?.spritesheetKey || '',
    });
    setTimeout(() => this.shifDeeB?.enterArena(
      getGameWidth(this)*.87,
      getGameHeight(this)*.5), 
      300);
    
    this.shifDeeC = new AarcPlayer({
      scene: this,
      gotchi: this.randomGotchiC,
      x: getGameWidth(this)*.73+getGameWidth(this)/2,
      y: getGameHeight(this)*.73,
      key: this.randomGotchiC?.spritesheetKey || '',
    });
    setTimeout(() => this.shifDeeC?.enterArena(
      getGameWidth(this)*.73,
      getGameHeight(this)*.73), 
      500);

    // create the shifDeez array for later useful handling
    this.shifDeez = [this.shifDeeA, this.shifDeeB, this.shifDeeC];
    
    // make a grayscale pipeline object
    const grayScalePipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.add('Gray', new GrayScalePipeline(this.game));

    // turn off all the shifDeez speech bubbles, menus and make them gray scale
    this.shifDeez.map( sd => {
      sd.setPipeline(grayScalePipeline);
      sd.setMenuVisible(false);
      sd.speechBubble.setVisible(false);
    });

    // create our selecton handler (this handler also makes everything interactive)
    this.selectionHandler = new AarcSelectionHandler(this, this.players, this.shifDeez);

    // create the round handler
    this.roundHandler = new AarcRoundHandler(this, this.players, this.shifDeez);

    // create an action confirmed button for the player to lock in actions
    // and then progress to next round
    this.actionConfirmed = new AarcButton({
      scene: this, 
      x: getGameWidth(this) - getRelative(50,this) - getRelative(300,this), 
      y: getGameHeight(this) - getRelative(50,this) - getRelative(100,this), 
      key: BUTTON_RECTANGLE_BLUE,
      width: getRelative(300,this),
      height: getRelative(100, this),
      initialText: 'LETS GO!',
      style: {
        fontSize: getRelative(48,this).toString() + 'px',
        fontFamily: 'lores-12, sans-serif, Comic Sans MS',
        color: '#ffffff',
        align: 'center',
      }
    })
    .setInteractive({cursor: 'pointer'})
    .setOrigin(0,0)
    .on('pointerdown', () => this.actionConfirmedClicked())
    .on('pointerover', () => this.actionConfirmedHoverOver())
    .on('pointerout', () => this.actionConfirmedHoverOut())
    .setVisible(true);

    // create a round button (not interactive, just counts rounds)
    this.roundButton = new AarcButton(
      {
        scene: this,
        x: getRelative(50,this),
        y: getRelative(50, this),
        key: BUTTON_RECTANGLE_BLUE,
        width: getRelative(300,this),
        height: getRelative(100, this),
        initialText: 'ROUND 1',
        style: {
          fontSize: getRelative(48,this).toString() + 'px',
          fontFamily: 'lores-12, sans-serif, Comic Sans MS',
          color: '#ffffff',
          align: 'center',
        }
      }
    )

    // charge all players/shifDeez special bar for first round
    this.players.map( p => p.adjustStat('SPECIAL_CURRENT', p.getStat('SPECIAL_RATE')));
    this.shifDeez.map( sd=> sd.adjustStat('SPECIAL_CURRENT', sd.getStat('SPECIAL_RATE')));
  }

  
  // helper function to find a random player for our shifDeez
  private getRandomPlayer = () : AarcPlayer | undefined => {

    // create an array of players that are still alive
    const alivePlayers = this.players?.filter( p => !p.isDead());
    const num = alivePlayers ? alivePlayers?.length : 0;
    const rand = Math.trunc(Math.random()*num);
    return alivePlayers ? alivePlayers[rand] : undefined;
  }

  // this is the most basic AI possible, 
  private assignShifDeezActions = () => {
    this.shifDeez?.map( sd => {
      if (!sd.isDead()) {
        const rando = this.getRandomPlayer();
        if (typeof rando !== "undefined") {
          sd.action = new AA_Attack(this, sd);
          sd.action.setTargets([rando]);
          sd.action.arm(true);
          sd.action.aim(false);
        }
      }
    });
  }

  // THIS IS THE MAIN FUNCTION THAT STARTS A NEW ROUND
  // define action confirmed button functions
  private actionConfirmedClicked = () => {
    this.actionConfirmed?.setTexture(BUTTON_RECTANGLE_BLUE);

    // give our shifDeez some actions
    this.assignShifDeezActions();

    // clear all our selections and disable the selection handler until
    // our last action emits an 'ACTIONS COMPLETE' event
    this.players?.map(p => p.setSelected(false));

    const sh = this.selectionHandler;
    const rh = this.roundHandler;

    if (sh && rh) {
      // disable the selection handler
      sh.setEnabled(false);

      // start the round
      rh.startRound();
    }
    
  }

  private actionConfirmedHoverOver = () => {
    this.actionConfirmed?.setTexture(BUTTON_RECTANGLE_BLUE);
  }
  
  private actionConfirmedHoverOut = () => {
    this.actionConfirmed?.setTexture(BUTTON_RECTANGLE_BLUE);
  }
      

  private createBackButton = () => {
    // make an exit button
    const exitBtn = new AarcButton({
      scene: this, 
      x: getGameWidth(this) - getRelative(50, this) - getRelative(100,this), 
      y: getRelative(50, this),
      key: BUTTON_SQUARE_BLUE,
      width: getRelative(100,this), 
      height: getRelative(100,this),
      initialText: 'X',
      style: {
        fontSize: getRelative(48,this).toString() + 'px',
        fontFamily: 'lores-12, sans-serif, Comic Sans MS',
        color: '#ffffff',
        align: 'center',
      }
    })
    .setInteractive({cursor: 'pointer'})
    .on('pointerdown', () => {
      this.back?.play();
      this.playVictoryScene();
      exitBtn.setTexture(BUTTON_SQUARE_BLUE);
    })
    .on('pointerover', () => exitBtn.setTexture(BUTTON_SQUARE_BLUE))
    .on('pointerout', () => exitBtn.setTexture(BUTTON_SQUARE_BLUE));
  }

  // call update
  public update(): void {
    // make some local consts for ease of handling.
    const ps = this.players;
    const sds = this.shifDeez;

    // Every frame update the player and shifDee gotchis
    ps?.map(p => p.update());
    sds?.map(sd => sd.update());

    // update the round handler
    if (this.roundHandler) {
      // if we've recently finished a round clear everything etc.
      if (this.roundHandler.getState() === 'COMPLETE') {
        console.log('are we making it here?')
        if (this.selectionHandler) this.selectionHandler.setEnabled(true);
        this.players?.map(p => p.clearActionAndMenu());
        this.roundCounter++;
        if (this.roundButton) this.roundButton.textObject.text = ('ROUND ' + this.roundCounter);
        // call all players round end function
        this.players?.map(p => p.roundEnd());
        this.shifDeez?.map(sd => sd.roundEnd());
        this.roundHandler.setState('NOT_STARTED');
      } else if (this.roundHandler.getState() === 'STARTED') {
        this.roundHandler.update();
      }
    }
  }


  // define our victory scene
  // want to dim entire scene, bring three gotchis to front and say victor/defeat
  public playVictoryScene() {
    // hide everything but background and players
    // this.actionTips?.setVisible(false);
    this.actionConfirmed?.setVisible(false);
    this.roundButton?.setVisible(false);

    // ensure all players actions are destroyed
    this.players?.map(p => { if (p.action) p.action.destroy() });
    this.shifDeez?.map(p => { if (p.action) p.action.destroy() });

    // loop through players
    let numPlayersAlive = 0;
    this.players?.map( p => {
      // count how many players alive
      if (!p.isDead()) numPlayersAlive++;
      // take away interactivity of player
      this.input.clear(p);
      // hide player stat bars and deselect
      p.setSelected(false);
      p.setStatBarVisible(false);
    });

    // loop through shifDeez
    let numShifDeezAlive = 0;
    this.shifDeez?.map( p => {
      // count how many shifdeez alive
      if (!p.isDead()) numShifDeezAlive++;
      // take away interactivity of shifdee
      this.input.clear(p);
      // hide all shifDeez
      p.setVisible(false);
    });

    let result: 'VICTORY!' | 'DEFEAT...' | 'DRAW...' = 'VICTORY!';
    if (numPlayersAlive > numShifDeezAlive) result = 'VICTORY!';
    else if (numPlayersAlive < numShifDeezAlive) result = 'DEFEAT...';
    else result = 'DRAW...';

    const style = {
      fontSize: (getGameHeight(this)*0.15).toString() + 'px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',}

    const resultText = this.add.text(
      getGameWidth(this)*0.5,
      getGameHeight(this)*0.2,
      result,
      style,
    )
    .setOrigin(0.5,0.5)
    .setDepth(5000);

    // create a black rectangle that masks the scene
    const mask = this.add.rectangle(0, 0, getGameWidth(this), getGameHeight(this), 0x000000)
      .setOrigin(0,0)
      .setAlpha(0.8);

    // tween our players up to larger size
    const targets = [
      {
        x: getGameWidth(this)*.2, 
        y: getGameHeight(this)*.55, 
        width: getGameWidth(this)/5, 
        height: getGameWidth(this)/5
      },
      {
        x: getGameWidth(this)*.5, 
        y: getGameHeight(this)*.55, 
        width: getGameWidth(this)/5, 
        height: getGameWidth(this)/5
      },
      {
        x: getGameWidth(this)*.8, 
        y: getGameHeight(this)*.55, 
        width: getGameWidth(this)/5, 
        height: getGameWidth(this)/5
      },];


    // tween the players up to big size
    let i = 0;
    this.players?.map(p => {
      // hide stat bars
      
      this.add.tween( {
        targets: p,
        x: targets[i].x,
        y: targets[i].y,
        displayWidth: targets[i].width,
        displayHeight: targets[i].height,
        duration: 500,
        ease: 'Quad.easeOut',
      });
      i++;
    })
    

    // create a button that takes us back when clicked
    const toMainMenu = new AarcButton({
      scene: this, 
      x: getGameWidth(this)*0.5 - getRelative(200,this), 
      y: getGameHeight(this) * 0.8,// - getRelative(100,this) - getRelative(50,this),
      key: BUTTON_RECTANGLE_BLUE,
      width: getRelative(400,this), 
      height: getRelative(100,this),
      initialText: 'MAIN MENU',
      style: {
        fontSize: getRelative(48,this).toString() + 'px',
        fontFamily: 'lores-12, sans-serif, Comic Sans MS',
        color: '#ffffff',
        align: 'center',
      }
    })
    .setInteractive({cursor: 'pointer'})
    .on('pointerdown', () => {
      window.history.back();
    })
    .on('pointerover', () => toMainMenu.setTexture(BUTTON_RECTANGLE_BLUE))
    .on('pointerout', () => toMainMenu.setTexture(BUTTON_RECTANGLE_BLUE));

  }

  

}
