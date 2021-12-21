// aarc-highlight-ring.ts - used to highlight gotchis
// container class for emitters and particles

import { AarcPlayer } from 'game/objects';
import { AARC_HIGHLIGHT_RING_DEPTH } from 'game/objects/object-depths';

export class AarcHighlightRing {
    private scene: Phaser.Scene;
    private highlightParticles;
    private highlightEmitter;

    constructor(scene: Phaser.Scene, particleTexture: string, player: AarcPlayer) {
        this.scene = scene;

        // create a highlight particle ring
        const shape = new Phaser.Geom.Ellipse(0, 0, player.displayWidth*.8, player.displayHeight*.8);

        this.highlightParticles = this.scene.add.particles(particleTexture)
        
        this.highlightEmitter = this.highlightParticles.createEmitter({
            x: player.x,
            y: player.y,//+player.displayHeight/1.6,
            scale: { start: 0.25, end: 0.0 },
            blendMode: 'ADD',
            speed: 25,
            lifespan: 1250,
            frequency: 25,
            emitZone: { type: 'random', source: shape, quantity: 25, yoyo: false }
        });

        // finally set our depth render order
        this.highlightParticles.setDepth(AARC_HIGHLIGHT_RING_DEPTH);
    }

    public start = () => {
        this.highlightEmitter.start();
        return this;
    }

    public stop = () => {
        this.highlightEmitter.stop();
        return this;
    }

    public setAlpha = (value: number) => {
        this.highlightEmitter.setAlpha(value);
        return this;
    }

    public setVisible = (visible: boolean) => {
        this.highlightEmitter.setVisible(visible);
    }

    public destroy() {
        this.highlightParticles.destroy();
    }
}