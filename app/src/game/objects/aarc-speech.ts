// aarc-speech.ts
// this object extends phaser image object to allow text to show in a speech bubble

import { SPEECH_BUBBLE } from 'game/assets';
import { AarcPlayer } from './aarc-player';
import { getGameWidth, getGameHeight } from 'game/helpers';
import { AARC_SPEECH_DEPTH } from './object-depths';


export class AarcSpeech extends Phaser.GameObjects.Image {
    // declare private objects
    private player: AarcPlayer;
    private speech: Phaser.GameObjects.Text;
    private box: any;
    private previousText = '';

    /**
     *
     * @param {string} text
     */
    private typewriteText(text: string, pauseAtChar: number) {
        const length = text.length
        let i = 0

        function nextText(i: number, aarcSpeech: AarcSpeech) {
            let blanks = '';
            for (let j = 0; j < length-i; j++) {
                blanks += ' ';
            }
            aarcSpeech.speech.text = text.substring(0,i+1) + blanks;  
        }

        let delay = 0;
        while (i < length) {
            delay += 50;
            if (i === pauseAtChar+1) delay += 500;
            this.scene.time.delayedCall(delay,nextText,[i, this]);
            i++;
        }

    }

    /**
     *
     * @param {string} text
     */
    typewriteTextWrapped(text: string, pauseAtChar: number) {
        const lines = this.speech.getWrappedText(text)
        const wrappedText = lines.join('\n')
        this.typewriteText(wrappedText, pauseAtChar)
    }


    constructor(scene: Phaser.Scene, player: AarcPlayer) {
        super(scene,0,0,SPEECH_BUBBLE);        
        
        // set dimensions
        this.displayWidth = getGameWidth(this.scene) * 0.25;
        this.displayHeight = getGameHeight(this.scene) * 0.15;

        // set origin to top left (makes text alignment easier)
        this.setOrigin(0,1);
        this.setDepth(AARC_SPEECH_DEPTH);

        const textOffset = {x: this.displayWidth*0.56, y: -this.displayHeight*.5 };
        const textDim = {width: this.displayWidth*.65, height: this.displayHeight*.62};
        
        // don't forget to add the speech bubble to the scene!
        this.scene.add.existing(this);
        
        // this box is mainly used for debugging
        this.box = this.scene.add.rectangle(
            this.x+textOffset.x, this.y+textOffset.y, 
            textDim.width, 
            textDim.height, 
            0xffffff)
                .setOrigin(0.5,0.5)
                .setDepth(AARC_SPEECH_DEPTH);

        // add the player and text
        this.player = player;
        this.speech = this.scene.add.text(
            this.x + textOffset.x,
            this.y + textOffset.y,
            '')
            .setOrigin(0.5,0.5)
            .setStyle({
                fontSize: (textDim.height/3.5).toString() + 'px',
                fontFamily: 'Arial',
                color: '#000000',
                align: 'center',
            })
            .setDepth(AARC_SPEECH_DEPTH)
            .setWordWrapWidth(textDim.width);
        
        // define the text for speech bubble
        const speak = 'DEFENSE READY!';
        
        this.speech.text = speak;
        this.typewriteTextWrapped(speak, 100);
    }

    public setText(text: string) {
        // store the previous text for hover outs
        this.previousText = this.speech.text;
        this.speech.text = text;
    }

    public setPreviousText() {
        this.speech.text = this.previousText;
    }

    public setVisible(visible: boolean) {
        super.setVisible(visible);
        this.speech.setVisible(visible);
        this.box.setVisible(visible);
        return this;
    }

    public getVisible() {
        return this.visible;
    }

    public update() {
        super.update();

        this.setPosition(this.player.x + this.player.displayWidth/2,
            this.player.y - this.player.displayHeight/4)
    }

    public setPosition(x: number, y: number) {
        super.setPosition(x,y);

        const textOffset = {x: this.displayWidth*0.56, y: -this.displayHeight*.5 };

        if (this.speech) this.speech.setPosition(this.x + textOffset.x,
            this.y + textOffset.y);

        if (this.box) this.box.setPosition(this.x + textOffset.x,
            this.y + textOffset.y);

        return this;
    }
}
