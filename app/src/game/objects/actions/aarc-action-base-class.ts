import { GameScene } from "game/scenes/game-scene";
import { AarcPlayer } from "../aarc-player";

export class AarcActionBaseClass {
    // protected variables
    protected scene: Phaser.Scene;
    protected actor: AarcPlayer;

    protected aiming = false;
    protected armed = false;
    protected visible = false;

    private state: 'NOT_STARTED' | 'STARTED' | 'COMPLETE' = 'NOT_STARTED';

    // actions need to be chainable so make a pointer to next action
    protected chainAction: AarcActionBaseClass | 0 = 0;

    // these two members to be set by children in constructor and setArmed.
    protected potentialTargets: AarcPlayer[] = [];
    protected targets: AarcPlayer[] = [];

    // define a cursor that gets called when aiming
    protected aimingCursor = 'pointer';
    public getAimingCursor() { return this.aimingCursor; }

    // call our constructor
    constructor(scene: Phaser.Scene, actor: AarcPlayer) {
        this.scene = scene;
        this.actor = actor;
    }

    public setState(state: 'NOT_STARTED' | 'STARTED' | 'COMPLETE') { 
        this.state = state;
    }

    public getState() { return this.state; }

    public aim(aiming: boolean) {
        this.aiming = aiming;
    }

    public isAiming(): boolean {
        return this.aiming;
    }

    public arm(armed: boolean) {
        this.armed = armed;
    }

    public isArmed(): boolean {
        return this.armed;
    }

    public execute(): void {
        // setState to started
        this.setState('STARTED');
    }

    // public getActionDuration() {
    //     return this.actionDuration;
    // }

    public getPotentialTargets(): AarcPlayer[] | 0 {
        return this.potentialTargets ? this.potentialTargets : 0;
    }

    public getTargets(): AarcPlayer[] | 0 {
        return this.targets ? this.targets : 0;
    }

    public setTargets(targets: AarcPlayer[]) {
        this.targets = targets;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
    }

    public destroy() {
        this.aiming = false;
        this.armed = false;
        // this.actionDuration = 0;
        this.visible = false;
    }

    // Mouse input handler functions
    // These should only be called when an action is in aiming mode
    // These should all be overidden but child classes
    public clickedPlayer(player: AarcPlayer) {
        if (player.gotchi) console.log(player.gotchi.name + ' was clicked while base class action was aiming');
    }

    public overPlayer(player: AarcPlayer) {
        if (player.gotchi) console.log(player.gotchi.name + ' was hovered over while base class action was aiming');
    }

    public outPlayer(player: AarcPlayer) {
        if (player.gotchi) console.log(player.gotchi.name + ' was hovered out while base class action was aiming');
    }
}