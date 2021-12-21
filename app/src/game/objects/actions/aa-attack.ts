// AA_Attack.ts - attack action
import { AarcHighlightRing } from '../aarc-highlight-ring';
import { AarcPlayer } from '../aarc-player';
import { AarcActionBaseClass } from 'game/objects/actions/aarc-action-base-class';
import { PARTICLE_RED } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { hitText } from 'game/objects/actions/helpers';

// helper function to find a random player for our shifDeez
const getRandomAarcPlayer = (players: AarcPlayer[] | undefined) : AarcPlayer | undefined => {
  const num = players ? players?.length : 0;
  const rand = Math.trunc(Math.random()*num);
  return players ? players[rand] : undefined;
}

export class AA_Attack extends AarcActionBaseClass {
  // private variables
  private targetRings: AarcHighlightRing[] = [];
    
  // call constructor
  constructor(scene: Phaser.Scene, actor: AarcPlayer) {
    super(scene, actor);
    this.aimingCursor = 'url(assets/input/crosshair32x32-red.png) 16 16, pointer';
  }

  // define private recoil function to invoke when we hit the target
  private dodge = (actor: AarcPlayer, scene: Phaser.Scene) => {
    
    const sideOfScreen = this.actor.x < actor.x ? 1 : -1;
    
    // grab the original co-ordinates of the actor
    const originalX = actor.x;
    const originalY = actor.y;

    const returnHome = () => {
      scene.tweens.add({
        targets: actor,
        x: originalX,
        y: originalY,
        angle: 0,
        duration: 350,
        ease: 'Quad.easeIn'
      })
    }
    
    scene.tweens.add({
      targets: actor,
      x: actor.x + 0.75*actor.displayWidth*sideOfScreen,
      y: actor.y + actor.displayHeight*0.2,
      angle: 30*sideOfScreen,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => {
        returnHome();
      }
    });
  }

  // define private recoil function to invoke when we hit the target
  private recoil = (actor: AarcPlayer, deltaX: number, deltaY: number, scene: Phaser.Scene) => {
    // grab the original co-ordinates of the actor to see what direction its coming from
    const originalX = actor.x;
    const originalY = actor.y;

    const returnHome = () => {
      scene.tweens.add({
        targets: actor,
        x: originalX,
        y: { value: originalY, duration: 500,
          ease: function(dt: number) {
            return dt + 0.1*Math.sin(dt*Math.PI);
          }},
        duration: 500,
        ease: 'Quad.easeIn'
      })
    }
    
    scene.tweens.add({
      targets: actor,
      x: actor.x + deltaX,
      y: { value: actor.y + deltaY, duration: 500,
        ease: function(dt: number) {
          return dt + 0.5*Math.sin(dt*Math.PI);
        }},
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => {
        returnHome();
      }
    });
  }

  // call this function to run the actual action
  public execute() {
    super.execute();

    // first thing to do is make sure this gotchi is drawn on top
    this.scene.children.bringToTop(this.actor);

    // if our target is dead we'll need a new target
    if (this.targets[0].isDead()) {
      // check if target is ally or shifdee
      let isTargetAlly = false;
      const gs = this.scene as GameScene;
      gs.players?.map(p => {
          if (p == this.targets[0]) isTargetAlly = true;
      });
      // now we know if targets an ally or shifdee so retarget to one of their comrades
      if (isTargetAlly) {
        const otherTargets = gs.players?.filter(p => !p.isDead());
        // set new target to random other alive player
        const newTarget = getRandomAarcPlayer(otherTargets);
        if (newTarget) this.targets[0] = newTarget;
        else alert('Error: No player targets left alive to execute attack')
        
      } else {
        const otherTargets = gs.shifDeez?.filter(p => !p.isDead());
        // set new target to random other alive shifDee
        const newTarget = getRandomAarcPlayer(otherTargets);
        if (newTarget) this.targets[0] = newTarget;
        else alert('Error: No shifDee targets left alive to execute attack')
      }
    }

    // see if we have a critical or miss condition
    const isCritical = this.actor.getStat('CRITICAL') > (Math.random()*100);
    const isMiss = (this.targets[0].getStat('EVASION') + (100-this.actor.getStat('ACCURACY'))) > (Math.random()*100)

    // calculate this gotchis attack power, should vary by random factor of 5%
    const RANDOM_FACTOR = 0.05; // this is in percent value and is how much
    let thisAttack = this.actor.getStat('ATTACK') * (1 + RANDOM_FACTOR - RANDOM_FACTOR*2*Math.random());
    // if our target has no action they are defending so half the attack
    if (!this.targets[0].action) thisAttack *= 0.5;
    // if its a critical attack double it
    if (isCritical) thisAttack *= 2;

    // tween attack animation has 4 parts but with onComplete chaining
    // we need to work backwards.
    // I NEED TO CHANGE THIS TO FOLLOW CURVES AND NOT USE SIN()
    // SIN() GIVES CRAZY RESULTS IF Y OF PLAYER AND TARGET IS NEAR IDENTICAL

    // start by finding out all the intermediate points we need
    const firstX = this.actor.x;
    const firstY = this.actor.y;
    const secondX = this.targets[0].x + (this.actor.x < this.targets[0].x ? -1.25*this.targets[0].displayWidth : 1.25*this.targets[0].displayWidth);
    const secondY = this.targets[0].y;
    const thirdX = this.actor.x < this.targets[0].x ? this.targets[0].x - this.targets[0].displayWidth/3 : this.targets[0].x + this.targets[0].displayWidth/3;
    const thirdY = this.targets[0].y - 0.75*this.targets[0].displayHeight;
    const fourthX = secondX;
    const fourthY = secondY;
    const fifthX = firstX;
    const fifthY = firstY;

    // find out the intermediate angles we need
    const firstAngle = this.actor.angle;
    const secondAngle = this.actor.x < this.targets[0].x ? this.actor.angle-30 : this.actor.angle+30;
    const thirdAngle = Math.random() < 0.5 ? this.actor.angle-60 : this.actor.angle+60;
    const fourthAngle = this.actor.x < this.targets[0].x ? this.actor.angle-330 : this.actor.angle+390;
    const fifthAngle = firstAngle;

    // define tween back to original position
    const moveBack = () => {
      this.scene.tweens.add({
        targets: this.actor,
        angle: fifthAngle,
        x: fifthX,
        y: { value: fifthY,
          ease: function(dt: number) {
            const tweak = 50/(fourthY - fifthY);
            return dt+tweak*Math.sin(dt*Math.PI);
          }
        },
        duration: 500,
        onComplete: () => { 
          if (this.actor.gotchi) console.log(this.actor.gotchi.name + ' action completed')
          this.setState('COMPLETE');
        },
      });
    }

    const jumpOff = () => {
      this.scene.tweens.add({
        targets: this.actor,
        angle: fourthAngle,
        x: fourthX,
        y: { value: fourthY, 
          ease: function(t: number) {
            return t-1.25*Math.sin(t*Math.PI);
          }
        },
        duration: 500,
        onComplete: () => {
          moveBack();
        }
      });
    }

    // find our targets recoil direction and normalize
    let deltaX = this.actor.x < this.targets[0].x ? 1 : -1;
    let deltaY = 1;
    const normalizer = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    deltaX = deltaX / normalizer * this.targets[0].displayWidth*1;
    deltaY = deltaY / normalizer * this.targets[0].displayWidth*1;

    // for jump on make sure we call targets recoil, set hp and generate damage text
    const jumpOn = () => {
      this.scene.tweens.add({
        targets: this.actor,
        angle: thirdAngle,
        x: thirdX,
        y: { value: thirdY, 
          ease: function(dt: number) {
            return dt + 1*Math.sin(dt*Math.PI);
          }
        },
        duration: 500,
        onComplete: () => {
          // check to see we didn't miss
          if (!isMiss) {
            this.targets[0].adjustStat('HP_CURRENT', -thisAttack);
            this.recoil(this.targets[0], deltaX, deltaY, this.scene);
            // if we have a crit hit add exclamation marks
            if (isCritical) hitText(this.scene, this.actor, this.targets[0], (Math.trunc(thisAttack)).toString() + '!!!');
            else hitText(this.scene, this.actor, this.targets[0], (Math.trunc(thisAttack)).toString());
          }
          jumpOff();
        }
      });
    }

    const moveForward = () => {
      this.scene.tweens.add({
        targets: this.actor,
        angle: secondAngle,
        x: {value: secondX, ease: 'Quad.easeOut' },
        y: { value: secondY,
          ease: function(dt: number) {
            const tweak = 25/(firstY - secondY);
            return dt+tweak*Math.sin(dt*Math.PI);
          }
        },
        duration: 500,
        onComplete: () => {
          jumpOn();
          // check to see if target dodged
          if (isMiss) {
            setTimeout(() => { 
              this.dodge(this.targets[0], this.scene);
              hitText(this.scene, this.actor, this.targets[0],'MISS');
            }, 400);
          }
        }
      });
    }

    // now everythings defined, start the tween
    moveForward();
    
  }

  // hide/show target rings
  public setVisible(visible: boolean) {
    super.setVisible(visible);
    // show or hide our target rings based on 'visible'.
    if (this.targetRings[0]) this.targetRings[0].setVisible(visible);
  }

  // destroy target rings
  public destroy() {
    super.destroy();
    if (this.targetRings[0]) this.targetRings[0].destroy();
  }

  // MOUSE INPUT HANDLER FUNCTIONS
  // These are called by the aarc-selection-handler object
  // These will only trigger if our action is aiming
  public clickedPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was clicked while attack action was aiming');
    
    // don't do anything if the player targeted is dead
    if (!player.isDead()) {
      // Make the clicked player our new target and show the highlight ring
      // the selection handler can be responsible for arming the gotchi
      this.targets[0] = player;
      this.targetRings[0].setVisible(true);
      this.targetRings[0].setAlpha(1);

      this.actor.speechBubble.setText('ATTACK READY AND TARGET ACQUIRED!')

    }
  }

  public overPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was hovered over while attack action was aiming');
    
    // don't do anything if the player targeted is dead
    if (!player.isDead()) {
      // make potential target rings if none made yet
      this.targetRings[0] = new AarcHighlightRing(this.scene,
        PARTICLE_RED, player);
      this.targetRings[0].setVisible(true);
      this.targetRings[0].setAlpha(0.2);

      this.actor.speechBubble.setText('ATTACK THIS TARGET?');
    }
  }

  public outPlayer(player: AarcPlayer) {
    if (player.gotchi) console.log(player.gotchi.name + ' was hovered out while attack action was aiming');
    
    // don't do anything if the player targeted is dead
    if (!player.isDead()) {
      // hide our target rings if we have them
      if (this.targetRings[0]) {
        this.targetRings[0].setVisible(false);
      }

      this.actor.speechBubble.setPreviousText();
    }
  }

}