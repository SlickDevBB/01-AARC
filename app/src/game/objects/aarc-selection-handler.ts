// aarc-selection-handler.ts - controls all selections of players at game-scene level

import { AarcPlayer } from "game/objects";

export class AarcSelectionHandler {
    private scene: Phaser.Scene;
    private players: AarcPlayer[];
    private shifDeez: AarcPlayer[];
    private all: AarcPlayer[];
    private enabled = true;

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

        // set all players to interactive with a pointer
        this.players.map( p => p.setInteractive({cursor: 'pointer'})
            .on('pointerdown', () => this.clickedPlayer(p))
            .on('pointerover', () => this.overPlayer(p))
            .on('pointerout', () => this.outPlayer(p)));

        // set all shifDeez to interactive with default cursor
        this.shifDeez.map( p => p.setInteractive({cursor: 'default'})
            .on('pointerdown', () => this.clickedPlayer(p))
            .on('pointerover', () => this.overPlayer(p))
            .on('pointerout', () => this.outPlayer(p)));

    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public isEnabled() {
        return this.enabled;
    }

    private playerMessage = (player: AarcPlayer, says: string) => {
        if (player.gotchi) console.log(player.gotchi.name + ' ' + says);
    }

    // if anyone is aiming return them
    private getPlayerAiming = (): AarcPlayer | 0 => {
        let pa: AarcPlayer | 0 = 0;
        this.players.map( p => {
            if (p.action && p.action.isAiming()) pa = p;
        });
        return pa;
    }

    // basic function to toggle selection between players
    private toggleSelectedPlayer = (togglePlayer: AarcPlayer) => {
        if (togglePlayer.isSelected()) {
            togglePlayer.setSelected(false);
            this.playerMessage(togglePlayer, 'deselected');
        } else {
            const deselectPlayers = this.players.filter(p => (p !== togglePlayer && p.isSelected()));
            deselectPlayers.map(p => {
                p.setSelected(false);
                this.playerMessage(p, 'deselected');
            });
            togglePlayer.setSelected(true);
            this.playerMessage(togglePlayer, 'selected');
        }
    }

    private clickedPlayer = (player: AarcPlayer) => {
        // don't let any selections happen if the selection handler isn't enabled
        if (this.isEnabled()) {

            // if a player is dead we shouldn't be able to select them
            if (!player.isDead()) {

                this.playerMessage(player, 'clicked');

                // when a player is clicked there should be 3 possible scenarios
                // (1) someone is aiming and not yet armed -> call action click handler
                // (2) someone is aiming and armed -> switch selected player
                // (3) no one is aiming -> switch selected player

                const pa = this.getPlayerAiming();
                const isShifDee = this.shifDeez.includes(player);

                if (pa) {
                    if (pa.action && !pa.action.isArmed()) {
                        pa.action.clickedPlayer(player);
                        pa.action.arm(true);
                        pa.action.aim(false);   // when armed we should no longer be in aim mode

                    } else if (pa.action && pa.action.isArmed()) {
                        if (!isShifDee) this.toggleSelectedPlayer(player);
                    }
                } else {
                    if (!isShifDee) this.toggleSelectedPlayer(player);
                }
            } else {
                player.speechBubble.setText('TOO TIRED FREN...');
                player.speechBubble.setVisible(!player.speechBubble.getVisible());
            }
        }
    }

    private overPlayer = (player: AarcPlayer) => {
        // don't let any selections happen if selection handler is disabled
        if (this.isEnabled()) {

            this.playerMessage(player, 'over');

            // when a player is hovered over there should be 3 possible scenarios
            // (1) someone is aiming and not yet armed -> call action click handler
            // (2) someone is aiming and armed -> switch selected player
            // (3) no one is aiming -> switch selected player

            const pa = this.getPlayerAiming();
            const isShifDee = this.shifDeez.includes(player);

            if (pa) {
                if (pa.action && !pa.action.isArmed()) {
                    // player is aiming but not yet armed
                    pa.action.overPlayer(player);
                } else if (pa.action && pa.action.isArmed()) {
                    // player is aiming and armed
                    if (!isShifDee && !player.isSelected()) player.setPotentialSelection(true);

                }
                // regardless, if we're over a player and aiming need to change cursor
                if (pa.action) this.scene.input.setDefaultCursor(pa.action.getAimingCursor());
            } else {
                // no one is aiming (may or may not be armed)
                if (!isShifDee && !player.isSelected()) player.setPotentialSelection(true);

            }

        }
    }

    private outPlayer = (player: AarcPlayer) => {
        // don't let any selections happen if handler is disabled
        if (this.isEnabled()) {
            
            this.playerMessage(player, 'out');

            // when a player is hovered out there should be 3 possible scenarios
            // (1) someone is aiming and not yet armed -> call action click handler
            // (2) someone is aiming and armed -> switch selected player
            // (3) no one is aiming -> switch selected player

            const pa = this.getPlayerAiming();
            const isShifDee = this.shifDeez.includes(player);

            if (pa) {
                if (pa.action && !pa.action.isArmed()) {
                    // player is aiming but not yet armed
                    pa.action.outPlayer(player);
                } else if (pa.action && pa.action.isArmed()) {
                    // player is aiming and armed so we can switch selection
                    if (!isShifDee && !player.isSelected()) player.setPotentialSelection(false);
                }
            } else {
                // no one is aiming (may or may not be armed)
                if (!isShifDee && !player.isSelected()) player.setPotentialSelection(false);
                // set to default cursor if we move off a player and no longer aiming
                this.scene.input.setDefaultCursor('default');
            }
        }
    }
}