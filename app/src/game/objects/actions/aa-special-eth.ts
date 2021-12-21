// AA_Attack.ts - attack action
import { AarcHighlightRing } from '../aarc-highlight-ring';
import { AarcPlayer } from '../aarc-player';
import { AarcActionBaseClass } from 'game/objects/actions/aarc-action-base-class';
import { PARTICLE_RED, PARTICLE_FLARES } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { getGameWidth, getGameHeight, getRelative, } from 'game/helpers';
import { hitText } from 'game/objects/actions/helpers';

export class AA_Special_ETH extends AarcActionBaseClass {
  // private variables
  private targetRings: AarcHighlightRing[] = [];
    
  // call constructor
  constructor(scene: Phaser.Scene, actor: AarcPlayer) {
    super(scene, actor);
    this.aimingCursor = 'url(assets/input/crosshair32x32-red.png) 16 16, pointer';
  }

  // define private recoil function to invoke when we hit the target
  private recoil = (target: AarcPlayer, direction: Phaser.Math.Vector2) => {
    // grab the original co-ordinates of the actor to see what direction its coming from
    const originalX = target.x;
    const originalY = target.y;

    const returnHome = () => {
      this.scene.tweens.add({
        targets: target,
        x: originalX,
        y: originalY,
        duration: 800,
        ease: 'Quad.easeIn'
      })
    }
    
    // add a tween that moves the target away
    this.scene.tweens.add({
      targets: target,
      x: target.x + direction.x,
      y: target.y + direction.y,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        returnHome();
      }
    });
  }

  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  }

  // define a function that creates a damage text tween
  // private damageText = (target: AarcPlayer, damage: number, direction: Phaser.Math.Vector2) => {
  //   // add a text object 
  //   const statChangeText = this.scene.add.text(
  //     this.actor.x < target.x ? target.x + target.displayWidth/2 : target.x - target.displayWidth/2, 
  //     target.y-target.displayHeight/2,
  //       Math.floor(damage).toString(),)
  //       .setVisible(true)
  //       .setStyle({fontSize: '40px', fontFamily: 'Comic Sans MS'})
  //       .setOrigin(0.5,0.5);

  //   // store target movement location for the text
  //   const targetX = target.x + direction.x;
  //   const targetY = target.y + direction.y;

  //   // add tween that moves text up and across in sin pattern
  //   this.scene.tweens.add({
  //     targets: statChangeText,
  //     x: targetX,
  //     y: targetY,
  //     alpha: 0,
  //     duration: 1000,
  //   });
  // }

  // function that returns a random value from the value given with the range of percent given
  private getBitOfRandom(value: number, percent: number) {
    const RANDOM_FACTOR = percent/100; // this is in percent value and is how much
    return value * (1 + RANDOM_FACTOR - RANDOM_FACTOR*2*Math.random());
  }

  // call this function to run the actual action
  public execute() {
    super.execute();
  
    // first thing to do is make sure this gotchi is drawn on top
    this.scene.children.bringToTop(this.actor);

    // steps of this special
    // (1) move backwards slowly and start spinning (wind up)
    // (2) spin fast and hit first target
    // (3) keep spinning and hit second target
    // (4) keep spinning and hit third target
    // (5) return home

    // get all targets
    const tgts = this.targets;

    // calculate this gotchis attack power, should vary by random factor of 5%
    const TOTAL_ATTACK_BONUS = 2.5;
    const eachAttack = this.getBitOfRandom(this.actor.getStat('ATTACK')*TOTAL_ATTACK_BONUS, 5)/tgts.length;

    // start by saving home position and windback for first tweens
    const homeX = this.actor.x;
    const homeY = this.actor.y;
    const windupX = this.actor.x < tgts[0].x ? this.actor.x - this.actor.displayWidth : this.actor.x + this.actor.displayWidth;
    const windupY = this.actor.y;

    const WINDUP_DURATION = 500;
    const BOUNCE_SPEED = 1250; // Define starting bounce speed in pixels/second
    const RETURN_DURATION= 1000;

    // make some particles
    const highlightParticles = this.scene.add.particles(PARTICLE_FLARES);
    const shape = new Phaser.Geom.Ellipse(0, 0, this.actor.displayWidth*.3, this.actor.displayHeight*.3);
    const highlightEmitter = highlightParticles.createEmitter({
        frame: { frames: [ 'red', 'blue', 'yellow', ], cycle: true },
        x: this.actor.x,
        y: this.actor.y,
        scale: { start: .7, end: 0.0 },
        blendMode: 'ADD',
        speed: 150,
        lifespan: 250,
        frequency: 1,
        emitZone: { type: 'edge', source: shape, quantity: 7, yoyo: false }
    });

    highlightEmitter.startFollow(this.actor,0,0);
    highlightEmitter.setAlpha(1);
    highlightEmitter.stop();

    // our last tween
    const returnHome = () => {
        this.scene.tweens.add({
          targets: this.actor,
          x: {value: homeX, ease: 'Quad.easeOut' },
          y: { value: homeY, ease: 'Quad.easeOut' },
          duration: RETURN_DURATION,
          angle: 3600,
          onComplete: () => {
            highlightEmitter.stop();
            this.setState('COMPLETE');
          },
        });
    }

      // target values will depend on which targeted gotchis remain
    const numTargets = tgts.length;
    console.log('num targets = ' + numTargets);
    let i = 0;
    console.log('i = ' + i);

    const hitTarget = () => {
      // calc recoil vector
      const vPTT = new Phaser.Math.Vector2(
        tgts[i].x - this.actor.x, 
        tgts[i].y - this.actor.y);
      const vTTNT = new Phaser.Math.Vector2(
        i < numTargets-1 ? tgts[i+1].x-tgts[i].x : homeX-tgts[i].x, 
        i < numTargets-1 ? tgts[i+1].y-tgts[i].y : homeY-tgts[i].y);
      const vRecoil = (vPTT.clone().normalize().add(vTTNT.clone().normalize().scale(-1))).normalize();

      // calc slow down factor
      const slow = Math.pow(0.75,i);

      // add our tween
      this.scene.tweens.add({
          targets: this.actor,
          x: {value: tgts[i].x, ease: 'Linear' },
          y: { value: tgts[i].y, ease: 'Linear' },
          angle: vPTT.length()*3600,
          duration: (vPTT.length()/BOUNCE_SPEED*1000)/slow,
          onComplete: () => {
            const thisAttack = this.getBitOfRandom(eachAttack,5);
            // this.damageText(tgts[i], thisAttack, vRecoil);
            hitText(this.scene, this.actor, tgts[i], (Math.trunc(thisAttack)).toString());
            this.recoil(tgts[i], vRecoil.scale(100));
            tgts[i].adjustStat('HP_CURRENT', -thisAttack);
            if (i < numTargets-1) {
                console.log(i);
                i++;
                hitTarget();
            } else {
                returnHome();
            }
          },
      });
    }

    const windup = () => {
      this.scene.tweens.add({
        targets: this.actor,
        x: {value: windupX, ease: 'Quad.easeOut' },
        y: { value: windupY, ease: 'Quad.easeOut' },
        angle: this.actor.x < tgts[0].x ? -90 : 90,
        duration: WINDUP_DURATION,
        onComplete: () => {
          hitTarget();
          highlightEmitter.start();
        }
      });
    }
    
    // now we can adjust special to zero and start our action
    this.actor.setStat('SPECIAL_CURRENT', 0);
    windup();
  }

  public setVisible(visible: boolean) {
    super.setVisible(visible);

    // show or hide our target rings based on 'visible'.
    this.targetRings.map(tr => tr.setVisible(visible));
  }

  public destroy() {
    super.destroy();
    this.targetRings.map(tr => tr.destroy());

  }

  // MOUSE INPUT HANDLER FUNCTIONS
  // These are called by the aarc-selection-handler object
  // These will only trigger if our action is aiming
  public clickedPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was clicked while special ETH action was aiming');
    
    // first see if we clicked player or opponents
    let isOverPlayer = false;
    const gs = this.scene as GameScene;
    gs.players?.map(p => {
        if (p == player) isOverPlayer = true;
    });

    if (isOverPlayer) {
        let i = 0;
        gs.players?.map(p => {
            this.targets[i] = p;
            this.targetRings[i].setVisible(true);
            this.targetRings[i].setAlpha(1);
            i++;
            console.log('targeting: ' + p.gotchi?.name);
        });
    } else {
        let i = 0;
        gs.shifDeez?.map(p => {
            this.targets[i] = p;
            this.targetRings[i].setVisible(true);
            this.targetRings[i].setAlpha(1);
            i++;
            console.log('targeting: ' + p.gotchi?.name);
        });
    }

    // now we want the first target to be the one clicked and randomise the other two
    const shuffledTargets = this.targets.filter(p => p !== player);
    this.shuffleArray(shuffledTargets);
    this.targets = [player, ...shuffledTargets];

    // 
    this.actor.speechBubble.setText('SPECIAL READY AND TARGETS ACQUIRED!')
  }

  public overPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was hovered over while special ETH action was aiming');
    
    // first see if we're over players or opponents
    let isOverPlayer = false;
    const gs = this.scene as GameScene;
    gs.players?.map(p => {
        if (p == player) isOverPlayer = true;
    });

    // if we're over player set target rings to players (otherwise set them over opponent)
    if (isOverPlayer) {
        let i = 0;
        gs.players?.map(p => {
            this.targetRings[i] = new AarcHighlightRing(this.scene,
                PARTICLE_RED, p);
              this.targetRings[i].setVisible(true);
              this.targetRings[i].setAlpha(0.2);
              i++;
              console.log('made ring for player ' + i);
        });
    } else {
        let i = 0;
        gs.shifDeez?.map(p => {
            this.targetRings[i] = new AarcHighlightRing(this.scene,
                PARTICLE_RED, p);
              this.targetRings[i].setVisible(true);
              this.targetRings[i].setAlpha(0.2);
              i++;
        });
    }

    this.actor.speechBubble.setText('START SPECIAL ON THIS TARGET?')

  }

  public outPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was hovered out while special ETH action was aiming');
    
    // hide our target rings if we have them
    this.targetRings.map(tg => {
        tg.setVisible(false);
    });

    this.actor.speechBubble.setPreviousText();
  
  }

}