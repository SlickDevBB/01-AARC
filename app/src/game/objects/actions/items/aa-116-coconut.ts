// AA_Attack.ts - attack action
import { AarcHighlightRing } from 'game/objects/aarc-highlight-ring';
import { AarcPlayer } from 'game/objects/aarc-player';
import { AarcActionBaseClass } from 'game/objects/actions/aarc-action-base-class';
import { PARTICLE_GREEN } from 'game/assets';
import { GameScene } from 'game/scenes/game-scene';
import { hitText } from 'game/objects/actions/helpers';

// helper function to find a random player for our shifDeez
const getRandomAarcPlayer = (players: AarcPlayer[] | undefined) : AarcPlayer | undefined => {
  const num = players ? players?.length : 0;
  const rand = Math.trunc(Math.random()*num);
  return players ? players[rand] : undefined;
}

export class AA_116_Coconut extends AarcActionBaseClass {
  // private variables
  private targetRings: AarcHighlightRing[] = [];
    
  // call constructor
  constructor(scene: Phaser.Scene, actor: AarcPlayer) {
    super(scene, actor);
    this.aimingCursor = 'url(assets/input/crosshair32x32-green.png) 16 16, pointer';
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
        y: { value: originalY, duration: 200,
          ease: function(dt: number) {
            return dt + 0.1*Math.sin(dt*Math.PI);
          }},
        duration: 200,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this.setState('COMPLETE');
        }
      })
    }
    
    scene.tweens.add({
      targets: actor,
      x: actor.x + deltaX,
      y: { value: actor.y + deltaY, duration: 200,
        ease: function(dt: number) {
          return dt + 0.5*Math.sin(dt*Math.PI);
        }},
      duration: 200,
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

    // calculate this gotchis attack power, should vary by random factor of 5%
    const hpUp = 75;

    // find our targets recoil direction and normalize
    let deltaX = this.actor.x < this.targets[0].x ? 1 : -1;
    let deltaY = 1;
    const normalizer = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    deltaX = deltaX / normalizer * this.targets[0].displayWidth*1;
    deltaY = deltaY / normalizer * this.targets[0].displayWidth*1;

    
    // start by making an image of the wearable
    const svg = this.scene.add.image(this.actor.x, this.actor.y,'wearable-116');
    svg.setDisplaySize(this.actor.displayWidth*0.25, this.actor.displayHeight*0.25);

    // lets try make a nice curved path for grenade throw
    const path = { t: 0, vec: new Phaser.Math.Vector2() };

    const curveTopX = this.actor.x + (this.targets[0].x - this.actor.x)*.5;
    const curveTopY = -2*this.actor.displayHeight + this.actor.y + (this.targets[0].y - this.actor.y)*0.5;

    const startPoint = new Phaser.Math.Vector2(this.actor.x, this.actor.y);
    const controlPoint1 = new Phaser.Math.Vector2(curveTopX, curveTopY);
    const endPoint = new Phaser.Math.Vector2(this.targets[0].x, this.targets[0].y);

    const curve = new Phaser.Curves.QuadraticBezier(startPoint, controlPoint1, endPoint);

    this.scene.tweens.add({
        targets: path,
        t: 1,
        onUpdate: () => {
          svg.x = curve.getPoint(path.t).x;
          svg.y = curve.getPoint(path.t).y;
        },
        duration: 750,
        onComplete: () => { 
          this.targets[0].adjustStat('HP_CURRENT', hpUp);
          hitText(this.scene, this.actor, this.targets[0], Math.floor(hpUp).toString())
          svg.destroy();
          this.recoil(this.targets[0], 0, -this.targets[0].displayHeight*0.25, this.scene);
          // find out which hand we used an item from
          const g = this.actor.gotchi;
          if (g) {
            if (g.equippedWearables[4] === 3) this.actor.adjustStat('ITEMS_RH', -1);
            else this.actor.adjustStat('ITEMS_LH', -1);  
          }
        },
    });
    
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
        PARTICLE_GREEN, player);
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