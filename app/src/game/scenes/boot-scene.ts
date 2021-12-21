import { AavegotchiGameObject, AavegotchiObject } from "types";
import { getGameHeight, getGameWidth } from "game/helpers";
import { assets, AtlasAsset, SpritesheetAsset } from "game/assets";
import { constructSpritesheet } from "../helpers/spritesheet";
import { customiseSvg } from "helpers/aavegotchi";
import { Socket } from "socket.io-client";
import { request } from "graphql-request";
import { Contract, ethers } from "ethers";
import diamondAbi from 'web3/abi/diamond.json';


// create our graph uri for random gotchi fetching
// const uri = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic';

interface AavegotchiWithSvg extends AavegotchiObject {
  svg: string;
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Boot",
};

/**
 * The initial scene that loads all necessary assets to the game.
 */
export class BootScene extends Phaser.Scene {
  private socket?: Socket;
  private connected?: boolean;
  private assetsLoaded?: boolean;
  private playerLoadCount?: number;
  private gotchiA?: AavegotchiGameObject;
  private gotchiB?: AavegotchiGameObject;
  private gotchiC?: AavegotchiGameObject;  
  private randomGotchiA?: AavegotchiGameObject;  
  private randomGotchiB?: AavegotchiGameObject;  
  private randomGotchiC?: AavegotchiGameObject;  
  private loadIndex: number;
  private progressBarContainer?: Phaser.GameObjects.Rectangle;
  private progressBar?: Phaser.GameObjects.Rectangle;
  private loadingText?: Phaser.GameObjects.Text;

  // I'm gonna add in wearables from aavegotchi wearables website so need
  // a new internal asset to add to the asset list depending on what gotchis
  // are wearing
  private allAssets = assets;

  constructor() {
    super(sceneConfig);
    this.loadIndex = 0;
    this.playerLoadCount = 0;
    
  }


  public preload = (): void => {
    // Construct progress bar
    this.createProgressBar();

    // Construct gotchi game object from registry
    const selectedGotchiA = this.game.registry.values.selectedGotchiA as AavegotchiWithSvg;
    this.gotchiA = {
      ...selectedGotchiA,
      spritesheetKey: "PLAYER_A",
    };

    // Gotchi B created from registry
    const selectedGotchiB = this.game.registry.values.selectedGotchiB as AavegotchiWithSvg;
    this.gotchiB = {
      ...selectedGotchiB,
      spritesheetKey: "PLAYER_B",
    };

    // Gotci C created from registry
    const selectedGotchiC = this.game.registry.values.selectedGotchiC as AavegotchiWithSvg;
    this.gotchiC = {
      ...selectedGotchiC,
      spritesheetKey: "PLAYER_C",
    };

    // Random A created from registry
    const randomGotchiA = this.game.registry.values.randomGotchis[0] as AavegotchiWithSvg;
    this.randomGotchiA = {
      ...randomGotchiA,
      spritesheetKey: "SHIFDEE_A",
    };

    // Random A created from registry
    const randomGotchiB = this.game.registry.values.randomGotchis[1] as AavegotchiWithSvg;
    this.randomGotchiB = {
      ...randomGotchiB,
      spritesheetKey: "SHIFDEE_B",
    };

    // Random A created from registry
    const randomGotchiC = this.game.registry.values.randomGotchis[2] as AavegotchiWithSvg;
    this.randomGotchiC = {
      ...randomGotchiC,
      spritesheetKey: "SHIFDEE_C",
    };

    // Checks connection to the server
    this.socket = this.game.registry.values.socket;
    !this.socket?.connected
      ? this.socket?.on("connect", () => {
          this.handleConnection();
        })
      : this.handleConnection();

    // Listener that triggers when an asset has loaded
    this.load.on(
      "filecomplete",
      (key: string) => {

        // check we have a valid player load count
        if (typeof this.playerLoadCount !== 'undefined') {
          // If we've loaded all players start the game
          if (this.playerLoadCount === 6) {
            // finally load in the shiftDeez
            this.assetsLoaded = true;
            this.loadingText?.setText(`Connecting to server...`);
            this.startGame();
          } else {
            // if we've got all our assets start looping through our players
            if ((this.loadIndex === this.allAssets.length) && (this.gotchiA) && (this.playerLoadCount === 0)) {
              this.loadingText?.setText('Loading Player A');
              this.loadInGotchiSpritesheet(this.gotchiA);
              this.playerLoadCount++;
            } else if ((this.loadIndex === this.allAssets.length) && (this.gotchiB) && (this.playerLoadCount === 1)) {
              this.loadingText?.setText('Loading Player B');
              this.loadInGotchiSpritesheet(this.gotchiB);
              this.playerLoadCount++;
            } else if ((this.loadIndex === this.allAssets.length) && (this.gotchiC) && (this.playerLoadCount === 2)) {
              this.loadingText?.setText('Loading Player C');
              this.loadInGotchiSpritesheet(this.gotchiC);
              this.playerLoadCount++;
            } else if ((this.loadIndex === this.allAssets.length) && (this.randomGotchiA) && (this.playerLoadCount === 3)) {
              this.loadingText?.setText('Loading ShifDee A');
              this.loadInGotchiSpritesheet(this.randomGotchiA);
              this.playerLoadCount++;
            } else if ((this.loadIndex === this.allAssets.length) && (this.randomGotchiB) && (this.playerLoadCount === 4)) {
              this.loadingText?.setText('Loading ShifDee B');
              this.loadInGotchiSpritesheet(this.randomGotchiB);
              this.playerLoadCount++;
            } else if ((this.loadIndex === this.allAssets.length) && (this.randomGotchiC) && (this.playerLoadCount === 5)) {
              this.loadingText?.setText('Loading ShifDee C');
              this.loadInGotchiSpritesheet(this.randomGotchiC);
              this.playerLoadCount++;
            } else {
                this.loadNextFile(this.loadIndex);
            }
          }
        }
      },
      this
    );
    this.loadNextFile(0);
  };

  /**
   * Submits gotchi data to the server and attempts to start game
   */
  private handleConnection = () => {
    this.connected = true;
    
    const gotchiA = this.game.registry.values.selectedGotchiA as AavegotchiObject;
    this.socket?.emit("setGotchiDataA", {
      name: gotchiA.name,
      tokenId: gotchiA.id,
    });

    // try set gotchi data for gotchi B too
    const gotchiB = this.game.registry.values.selectedGotchiB as AavegotchiObject;
    this.socket?.emit("setGotchiDataB", {
      name: gotchiB.name,
      tokenId: gotchiB.id,
    });

    // try set gotchi data for gotchi C too
    const gotchiC = this.game.registry.values.selectedGotchiC as AavegotchiObject;
    this.socket?.emit("setGotchiDataC", {
      name: gotchiC.name,
      tokenId: gotchiC.id,
    });
    
    this.startGame();
  };

  

  /**
   * If all the assets are loaded in, and user is connected to server, start game
   */
  private startGame = () => {
    if (this.assetsLoaded && this.connected) {
      this.scene.start("Game", { 
        selectedGotchiA: this.gotchiA, 
        selectedGotchiB: this.gotchiB, 
        selectedGotchiC: this.gotchiC,
        randomGotchiA: this.randomGotchiA,
        randomGotchiB: this.randomGotchiB,
        randomGotchiC: this.randomGotchiC, });
    }
  };

  /**
   * Renders UI component to display loading progress
   */
  private createProgressBar = () => {
    const width = getGameWidth(this) * 0.5;
    const height = 12;
    this.progressBarContainer = this.add
      .rectangle(
        getGameWidth(this) / 2,
        getGameHeight(this) / 2,
        width,
        height,
        0x12032e
      )
      .setOrigin(0.5);

    this.progressBar = this.add
      .rectangle(
        (getGameWidth(this) - width) / 2,
        getGameHeight(this) / 2,
        0,
        height,
        0x6d18f8
      )
      .setOrigin(0, 0.5);

    this.loadingText = this.add
      .text(getGameWidth(this) / 2, getGameHeight(this) / 2 - 32, "Loading...")
      .setFontSize(24)
      .setOrigin(0.5);
  };

  /**
   * Iterates through each file in the assets array
   */
  private loadNextFile = (index: number) => {
    const file = this.allAssets[index];
    this.loadIndex++;

    if (this.loadingText && this.progressBar && this.progressBarContainer) {
      this.loadingText.setText(`Loading: ${file.key}`);
      this.progressBar.width =
        (this.progressBarContainer.width / this.allAssets.length) * index;
    }

    switch (file.type) {
      case "IMAGE":
        this.load.image(file.key, file.src);
        break;
      case "SVG":
        this.load.svg(file.key, file.src);
        break;
      case "AUDIO":
        this.load.audio(file.key, [file.src]);
        break;
      case "SPRITESHEET":
        this.load.spritesheet(
          file.key,
          file.src,
          (file as SpritesheetAsset).data
        );
        break;
      case "ATLAS":
        this.load.atlas(
          file.key,
          file.src,
          (file as AtlasAsset).atlasSrc,
        )
        break;
      default:
        break;
    }
  };

  /**
   * Constructs and loads in the Aavegotchi spritesheet, you can use customiseSVG() to create custom poses and animations
   */
  private loadInGotchiSpritesheet = async (
    gotchiObject: AavegotchiGameObject
  ) => {
    const svg = gotchiObject.svg;
    const spriteMatrix = [
      [
        customiseSvg(svg, { removeBg: true }),
        customiseSvg(svg, {
          armsUp: true,
          eyes: "happy",
          float: true,
          removeBg: true,
        }),
        customiseSvg(svg, {
          armsUp: false,
          eyes: "sleeping",
          float: false,
          removeBg: true,
          mouth: 'neutral',
        }),
        customiseSvg(svg, {
          armsUp: false,
          eyes: "sleeping",
          float: true,
          removeBg: true,
          mouth: 'neutral',
        }),
      ],
    ];

    const { src, dimensions } = await constructSpritesheet(spriteMatrix);
    this.load.spritesheet(gotchiObject.spritesheetKey, src, {
      frameWidth: dimensions.width / dimensions.x,
      frameHeight: dimensions.height / dimensions.y,
    });
    //console.log("we loaded the spritesheet for: " + gotchiObject.name);
    this.load.start();
  };
}
