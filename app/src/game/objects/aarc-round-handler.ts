// aarc-round-handler.ts
// plays out actions for a round

import { AarcPlayer } from "game/objects";
import { GameScene } from 'game/scenes/game-scene';

export class AarcRoundHandler {
    private scene: Phaser.Scene;
    private players: AarcPlayer[];
    private shifDeez: AarcPlayer[];
    private all: AarcPlayer[];
    private allInOrder: AarcPlayer[] = [];
    private state: 'NOT_STARTED' | 'STARTED' | 'COMPLETE' = 'NOT_STARTED';
    private activePlayer = 0;

    // define our constructor
    constructor(
        scene: Phaser.Scene, 
        players: AarcPlayer[],
        shifDeez: AarcPlayer[],
        ) {
            this.scene = scene;
            this.players = players;
            this.shifDeez = shifDeez;
            this.all = [...players, ...shifDeez];

            // this is where we also create the turn order HUD...
    }

    public setState(state: 'NOT_STARTED' | 'STARTED' | 'COMPLETE') { 
        this.state = state;
    }

    public getState() { return this.state; }

    public startRound() {
        // first lets state to started
        this.state = 'STARTED';
        this.activePlayer = 0;

        // now determine player order based on speed (and other stats)
        // start by assigning all players/shifDeez to an array
        this.allInOrder = this.all;

        // sort gotchis first based on speed, then evasion, then accuracy, then items
        this.allInOrder.sort( (a,b) : number => { 
            if (typeof a !== 'undefined' && typeof b !== 'undefined') {
                if (a.getStat('SPEED') !== b.getStat('SPEED'))
                    return b?.getStat('SPEED') - a?.getStat('SPEED') 
                else if (a.getStat('EVASION') !== b.getStat('EVASION'))
                    return b?.getStat('EVASION') - a?.getStat('EVASION') 
                else if (a.getStat('ACCURACY') !== b.getStat('ACCURACY'))
                    return b?.getStat('ACCURACY') - a?.getStat('ACCURACY') 
                else {
                    if (Math.random() < 0.5) return -1;
                    else return 1;
                }
            }
            return 1;
        });

        console.log(this.allInOrder);

    }

    // update just needs to be called in the main scene update
    public update() {
        // if we've started the round handler, go through and run actions
        if (this.state === 'STARTED') {
            // get the current player action
            const gotchi = this.allInOrder[this.activePlayer];
            const action = gotchi ? gotchi.action : 0;
            if (action && action.isArmed()) {
                // if not yet started, execute it
                console.log(action.getState());
                if (action.getState() === 'NOT_STARTED') {
                    if (gotchi.gotchi) console.log(gotchi.gotchi.name + ': execute action once');
                    action.execute();
                } // else if its done reset the state and go to next player
                else if (action.getState() === 'COMPLETE') {
                    // after execution of each state we need to check for the victory condition
                    // make some local consts for ease of handling.
                    const ps = this.players;
                    const sds = this.shifDeez;
                    const gs = this.scene as GameScene;

                    // check for victory/defeat condition
                    if (ps?.length === ps?.filter(p => p.isDead()).length || 
                    sds?.length === sds?.filter(p => p.isDead()).length) {
                        gs.playVictoryScene();
                    }

                    // go to next active player
                    this.activePlayer++;
                }
            } else {
                this.activePlayer++;
            }

            // if we've gotten to last player set round handler state to complete
            if (this.activePlayer >= this.allInOrder.length) {
                this.state = 'COMPLETE';
            }
        }
    }

}