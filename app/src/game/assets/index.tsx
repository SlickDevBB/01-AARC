// 

export interface Asset {
  key: string;
  src: string;
  type: 'IMAGE' | 'SVG' | 'SPRITESHEET' | 'AUDIO' | 'ATLAS';
  atlasSrc?: string;
  data?: {
    frameWidth?: number;
    frameHeight?: number;
  };
}

export interface SpritesheetAsset extends Asset {
  type: 'SPRITESHEET';
  data: {
    frameWidth: number;
    frameHeight: number;
  };
}

export interface AtlasAsset extends Asset {
  type: 'ATLAS';
  atlasSrc: string;
  data: {
    frameWidth: number;
    frameHeight: number;
  };
}


export const BG = 'bg';
export const FULLSCREEN = 'fullscreen';
export const LEFT_CHEVRON = 'left_chevron';
export const CLICK = 'click';
export const STAT_BAR_BG = 'stat_bar_bg';
export const STAT_BAR_GREEN = 'stat_bar_green';
export const STAT_BAR_BLUE = 'stat_bar_blue';
export const STAT_BAR_RED = 'stat_bar_red';
export const PARTICLE_BLUE = 'particle_blue';
export const PARTICLE_RED = 'particle_red';
export const PARTICLE_GREEN = 'particle_green';
export const PARTICLE_FLARES = 'particle_flares';
export const BUTTON_BG_NOT_SELECTED = 'button_bg_not_selected';
export const BUTTON_BG_HOVERED = 'button_bg_hovered';
export const BUTTON_BG_SELECTED = 'button_bg_selected';
export const BUTTON_RECTANGLE_BLUE = 'button_rectangle_blue';
export const BUTTON_SQUARE_BLUE = 'button_square_blue';
export const BUTTON_SQUARE_BLACK = 'button_square_black';
export const SPEECH_BUBBLE = 'speech_bubble';
export const BLACK_CIRCLE_SHADED = 'black-circle-shaded'
export const WHITE_CIRCLE_SHADED = 'white-circle-shaded'

// all our collateral types
export const aAAVE = 'aAAVE';
export const aDAI = 'aDAI';
export const aETH = 'aETH';
export const aLINK = 'aLINK';
export const aTUSD = 'aTUSD';
export const aUNI = 'aUNI';
export const aUSDC = 'aUSDC';
export const aUSDT = 'aUSDT';
export const aYFI = 'aYFI';

// all our menu icons
export const ICON_ATTACK = 'icon_attack';
export const ICON_SPECIAL = 'icon_special';
export const ICON_ITEMBAG = 'icon_button';

const makeWearableList = (numbers: string[]): Array<Asset | SpritesheetAsset> => {
  const wearableAssets: Array<Asset | SpritesheetAsset> = [];
  for (let i = 0; i < numbers.length; i++) {
    wearableAssets.push( {
      key: 'wearable-' + numbers[i],
      src: 'assets/wearables/' + numbers[i] + '.svg',
      type: 'IMAGE',
    })
  }
  return wearableAssets;
}

// Save all in game assets in the public folder
export const assets: Array<Asset | SpritesheetAsset> = [
  {
    key: BG,
    src: 'assets/bg/citadel.png',
    type: 'IMAGE',
  },
  {
    key: LEFT_CHEVRON,
    src: 'assets/icons/chevron_left.svg',
    type: 'SVG',
  },
  {
    key: CLICK,
    src: 'assets/sounds/click.mp3',
    type: 'AUDIO',
  },
  {
    key: STAT_BAR_BG,
    src: 'assets/images/statbarbg.png',
    type: 'SPRITESHEET',
    data: {
      frameWidth: 500,
      frameHeight: 100,
    }
  },
  {
    key: STAT_BAR_GREEN,
    src: 'assets/images/statbargreen.png',
    type: 'IMAGE',
    data: {
      frameWidth: 500,
      frameHeight: 100,
    }
  },
  {
    key: STAT_BAR_BLUE,
    src: 'assets/images/statbarblue.png',
    type: 'IMAGE',
    data: {
      frameWidth: 500,
      frameHeight: 100,
    }
  },
  {
    key: STAT_BAR_RED,
    src: 'assets/images/statbarred.png',
    type: 'IMAGE',
    data: {
      frameWidth: 500,
      frameHeight: 100,
    }
  },
  {
    key: PARTICLE_BLUE,
    src: 'assets/images/blue.png',
    type: 'IMAGE',
  },
  {
    key: PARTICLE_RED,
    src: 'assets/images/red.png',
    type: 'IMAGE',
  },
  {
    key: PARTICLE_GREEN,
    src: 'assets/images/green.png',
    type: 'IMAGE',
  },
  {
    key: PARTICLE_FLARES,
    src: 'assets/images/flares.png',
    atlasSrc: 'assets/images/flares.json',
    type: 'ATLAS',
  },
  {
    key: BUTTON_RECTANGLE_BLUE,
    src: 'assets/input/button-250x100-blue.png',
    type: 'IMAGE',
  },
  {
    key: BUTTON_SQUARE_BLUE,
    src: 'assets/input/button-100x100-blue.png',
    type: 'IMAGE',
  },
  {
    key: BUTTON_SQUARE_BLACK,
    src: 'assets/input/button-100x100-black.png',
    type: 'IMAGE',
  },
  {
    key: BUTTON_BG_NOT_SELECTED,
    src: 'assets/input/rectangle button.png',
    type: 'IMAGE',
  },
  {
    key: BUTTON_BG_HOVERED,
    src: 'assets/input/rectangle button.png',
    type: 'IMAGE',
  },
  {
    key: BUTTON_BG_SELECTED,
    src: 'assets/input/rectangle button.png',
    type: 'IMAGE',
  },
  {
    key: SPEECH_BUBBLE,
    src: 'assets/icons/speech-bubble-v2.png',
    type: 'IMAGE',
  },
  {
    key: ICON_ATTACK,
    src: 'assets/icons/aarc-attack-icon.png',
    type: 'IMAGE',
  },
  {
    key: ICON_SPECIAL,
    src: 'assets/icons/aarc-special-icon.png',
    type: 'IMAGE',
  },
  {
    key: ICON_ITEMBAG,
    src: 'assets/icons/aarc-item-icon.png',
    type: 'IMAGE',
  },
  {
    key: BLACK_CIRCLE_SHADED,
    src: 'assets/icons/black-circle-shaded.png',
    type: 'IMAGE',
  },
  {
    key: WHITE_CIRCLE_SHADED,
    src: 'assets/icons/white-circle-shaded.png',
    type: 'IMAGE',
  },

  // ok, lets load in all the hand wearables...
  ...makeWearableList([
    '003', '006', '009', '012', '017', '020', '023', '026', '029', '032',
    '038', '041', '044', '047', '051', '058', '069', '070', '075', '076',
    '079', '082', '083', '089', '092', '093', '096', '099', '100', '103',
    '106', '107', '110', '113', '116', '118', '119', '120', '121', '122', 
    '123', '130', '134', '137', '141', '148', '158', '201', '204', '205',
  ]),

  // now load in all collateral svg's
  {
    key: aAAVE,
    src: 'assets/collaterals/aAAVE.svg',
    type: 'IMAGE',
  },
  {
    key: aDAI,
    src: 'assets/collaterals/aDAI.svg',
    type: 'IMAGE',
  },
  {
    key: aETH,
    src: 'assets/collaterals/aETH.svg',
    type: 'IMAGE',
  },
  {
    key: aLINK,
    src: 'assets/collaterals/aLINK.svg',
    type: 'IMAGE',
  },
  {
    key: aTUSD,
    src: 'assets/collaterals/aTUSD.svg',
    type: 'IMAGE',
  },
  {
    key: aUNI,
    src: 'assets/collaterals/aUNI.svg',
    type: 'IMAGE',
  },
  {
    key: aUSDC,
    src: 'assets/collaterals/aUSDC.svg',
    type: 'IMAGE',
  },
  {
    key: aUSDT,
    src: 'assets/collaterals/aUSDT.svg',
    type: 'IMAGE',
  },
  {
    key: aYFI,
    src: 'assets/collaterals/aYFI.svg',
    type: 'IMAGE',
  },

];

