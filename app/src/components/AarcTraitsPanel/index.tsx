import React from 'react'
import { AavegotchiObject } from 'types';
import styles from './styles.module.css';
import { getDefaultGotchi } from 'helpers/aavegotchi';

// define our props to pass to main component
interface IProps {
    gotchi: AavegotchiObject;
}

// define interface for aarc specific stats
export interface AarcTraits {
    HP: number, speed: number,
    evasion: number, attack: number,
    accuracy: number, specialRate: number,
    critical: number, items: number,
}

// define percentage interface for rendering meters
// interface percentAarcTraits {
//     HP: string, speed: string,
//     evasion: string, attack: string,
//     accuracy: string, specialRate: string,
//     critical: string, items: string,
// }

// define const values for aarc traits
const minAarcTraits : AarcTraits = {
    HP: 300, speed: 0,
    evasion: 0, attack: 50,
    accuracy: 75, specialRate: 20,
    critical: 0, items: 0,
}

const maxAarcTraits : AarcTraits = {
    HP: 600, speed: 99,
    evasion: 25, attack: 100,
    accuracy: 100, specialRate: 50,
    critical: 25, items: 4,
}

const defaultAarcTraits : AarcTraits = {
    HP: 450, speed: 50,
    evasion: 10, attack: 75,
    accuracy: 87.5, specialRate: 34,
    critical: 10, items: 2,
}

export const calculateAarcTraits = (gotchi: AavegotchiObject) : AarcTraits => {
    
    let g = undefined;
    
    if (typeof gotchi === 'undefined') {
        g = getDefaultGotchi();
    } else {
        g = gotchi;
    }

    const NRG = g.withSetsNumericTraits[0];
    const AGG = g.withSetsNumericTraits[1];
    const SPK = g.withSetsNumericTraits[2];
    const BRN = g.withSetsNumericTraits[3];

    const valHP = minAarcTraits.HP + (maxAarcTraits.HP - minAarcTraits.HP) * ((100-NRG)/100);
    const valEvasion = minAarcTraits.evasion + (maxAarcTraits.evasion - minAarcTraits.evasion) * ((100-AGG)/100);
    const valAccuracy = minAarcTraits.accuracy + (maxAarcTraits.accuracy - minAarcTraits.accuracy) * ((100-SPK)/100);
    const valCritical = minAarcTraits.critical + (maxAarcTraits.critical - minAarcTraits.critical) * ((100-BRN)/100);
    const valSpeed = minAarcTraits.speed + (maxAarcTraits.speed - minAarcTraits.speed) * ((NRG)/100);
    const valAttack = minAarcTraits.attack + (maxAarcTraits.attack - minAarcTraits.attack) * ((AGG)/100);
    const valSpecialRate = minAarcTraits.specialRate + (maxAarcTraits.specialRate - minAarcTraits.specialRate) * ((SPK)/100);
    const valItem = minAarcTraits.items + (maxAarcTraits.items - minAarcTraits.items) * ((BRN)/100);

    const at : AarcTraits = {
        HP: Math.trunc(valHP), speed: Math.trunc(valSpeed),
        evasion: Math.trunc(valEvasion), attack: Math.trunc(valAttack),
        accuracy: Math.trunc(valAccuracy), specialRate: Math.trunc(valSpecialRate),
        critical: Math.trunc(valCritical), items: Math.trunc(valItem),
    };

    return at;

}

const powerWidthString = (side: 'left' | 'right', trait: number) : string => {
    if (side === 'left') {
        if (trait > 100) return '0%';
        else if (trait < 0) return '100%';
        else return (100-trait).toString() + '%';
    } else {
        if (trait > 100) return '100%';
        else if (trait < 0) return '0%';
        else return (trait).toString() + '%';
    }
}


// this component calculates and renders traits for a given gotchi
export const AarcTraitsPanel = ({gotchi} : IProps ) => {

    const at = calculateAarcTraits(gotchi);

    const NRG = gotchi.withSetsNumericTraits[0];
    const AGG = gotchi.withSetsNumericTraits[1];
    const SPK = gotchi.withSetsNumericTraits[2];
    const BRN = gotchi.withSetsNumericTraits[3];
    
    return (
        <div className={styles.aarcTraitsContainer}>
            <div className={styles.leftTraits}>
                <div>HP: {at.HP}</div>
                <div className={styles.leftMeter}>
                    <span className={styles.leftPower} style={{width: powerWidthString('left', NRG)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Evasion: {at.evasion}%</div>
                <div className={styles.leftMeter}>
                    <span className={styles.leftPower} style={{width: powerWidthString('left', AGG)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Accuracy: {at.accuracy}%</div>
                <div className={styles.leftMeter}>
                    <span className={styles.leftPower} style={{width: powerWidthString('left', SPK)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Critical: {at.critical}%</div>
                <div className={styles.leftMeter}>
                    <span className={styles.leftPower} style={{width: powerWidthString('left', BRN)}}/>
                </div>
            </div>

            <div className={styles.middleTraits}>
                <div>NRG</div>
                <div>{NRG}</div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>AGG</div>
                <div>{AGG}</div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>SPK</div>
                <div>{SPK}</div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>BRN</div>
                <div>{BRN}</div>
            </div>

            <div className={styles.rightTraits}>
            <div>Speed: {at.speed}</div>
                <div className={styles.rightMeter}>
                    <span className={styles.rightPower} style={{width: powerWidthString('right', NRG)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Attack: {at.attack}</div>
                <div className={styles.rightMeter}>
                    <span className={styles.rightPower} style={{width: powerWidthString('right', AGG)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Special: {at.specialRate}</div>
                <div className={styles.rightMeter}>
                    <span className={styles.rightPower} style={{width: powerWidthString('right', SPK)}}/>
                </div>
                {/*spacer*/}
                <div className={styles.spacer}/>
                {/*spacer*/}
                <div>Items: {at.items}</div>
                <div className={styles.rightMeter}>
                    <span className={styles.rightPower} style={{width: powerWidthString('right', BRN)}}/>
                </div>
            </div>
        </div>
    )
}
