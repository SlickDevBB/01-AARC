// aarc-statbar.ts - main stat bar for aarc
import { STAT_BAR_GREEN, STAT_BAR_BLUE } from 'game/assets';
import { getRelative } from 'game/helpers';

interface Props {
    scene: Phaser.Scene;
    x: number;
    y: number;
    frame?: number;
    key: string;
    width: number;
    height: number;
    initialText: string;
    style?: {
        fontSize: string;
        fontFamily: string;
        color: string;
        align: string;
    }
    
}

export class AarcButton extends Phaser.GameObjects.Image {

    // define private sub images
    public textObject: any;

    // a private variable to see if this buttons been clicked
    private selected = false;
    
    // call the constructor
    constructor({ scene, x, y, key, width, height, initialText, style = {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',}} : Props) 
        {
        
        super(scene, x, y, key);

        this.scene.add.existing(this);

        this.setOrigin(0,0);     
        this.displayWidth = width;
        this.displayHeight = height;

        this.textObject = this.scene.add.text(
            this.x+width/2,
            this.y+height/2,
            initialText,)
            .setOrigin(0.5,0.5)
            .setStyle(style)
            .setVisible(true);

    }

    // call update
    public update(): void {
        //console.log(aarcbutton update calling?);
        const a = 0;
        
        
    }

    public setVisible = (visible: boolean) : this => {
        super.setVisible(visible);
        this.textObject.setVisible(visible);
        return this;
    }

    public setSelected = (selected: boolean) => {
        this.selected = selected;
       
    }

    public isSelected = () => { return this.selected; }
    
}