import { AavegotchiObject } from 'types';
import { ChevronUp } from 'assets';
import { bounceAnimation, convertInlineSVGToBlobURL, removeBG } from 'helpers/aavegotchi';
import { playSound } from 'helpers/hooks/useSound';
import globalStyles from 'theme/globalStyles.module.css';
import { useEffect, useState, useCallback } from 'react';
import gotchiLoading from 'assets/gifs/loading.gif';
import useWindowWidth from 'helpers/hooks/windowSize';
import styles from './styles.module.css';
import { AarcTraitsPanel, GotchiSVG } from 'components';
import { useServer } from "server-store";

interface Props {
    userGotchis?: Array<AavegotchiObject>;
    initialGotchiIndexA?: number;
    initialGotchiIndexB?: number;
    initialGotchiIndexC?: number;
    selectAarcGotchis: (gotchiIndexA: number, gotchiIndexB: number, gotchiIndexC: number) => void
  }

export const AarcGotchiSelector = ( {userGotchis,
    initialGotchiIndexA=0, initialGotchiIndexB=1, initialGotchiIndexC=2, 
    selectAarcGotchis} : Props) => {

    const [selectedA, setSelectedA] = useState<number>();
    const [selectedB, setSelectedB] = useState<number>();
    const [selectedC, setSelectedC] = useState<number>();
    const [initialised, setInitialised] = useState<boolean>(false);

    const { highscores } = useServer();

    const handleAarcSelect = useCallback(
        (indexA: number, indexB: number, indexC: number) => {

        if (indexA === selectedA && indexB === selectedB && indexC === selectedB) {
            return;
        }

        setSelectedA(indexA);
        setSelectedB(indexB);
        setSelectedC(indexC);

        if (userGotchis) {
            selectAarcGotchis(indexA, indexB, indexC);
        }


    }, [userGotchis, selectAarcGotchis, selectedA, selectedB, selectedC]);


    useEffect(() => {
        // this useEffect should only be called if we haven't initialised
        if (userGotchis && !initialised) {
            const indexA = initialGotchiIndexA;
            const indexB = initialGotchiIndexB;
            const indexC = initialGotchiIndexC;
            handleAarcSelect(indexA, indexB, indexC);
            setInitialised(true);
        }
    }, [userGotchis, initialGotchiIndexA, initialGotchiIndexB, initialGotchiIndexC, handleAarcSelect, selectedA]);

    const handleSVG = (svg: string) => {
        const a = removeBG(svg);
        const b = bounceAnimation(a)
        return convertInlineSVGToBlobURL(b);
    }

    // define a more generic set gotchi function that takes a string
    const setSelectedGotchi = (gotchi: string, value: number) => {
        if ( (typeof selectedA !== 'undefined') && (typeof selectedB !== 'undefined') && (typeof selectedC !== 'undefined') ) {
            if (gotchi === "A") {
                handleAarcSelect(value, selectedB, selectedC);
            } else if (gotchi === "B") {
                handleAarcSelect(selectedA, value, selectedC);
            } else {
                handleAarcSelect(selectedA, selectedB, value);
            }
        }
    }

    // handlescroll
    const handleScroll = (gotchi: string, scrollValue : number) => {

        // create an array of numbers that are not currently selected
        let filtered : number[] = [];
        if (userGotchis) {
            filtered = Array.from(Array(userGotchis.length).keys());
            filtered = filtered.filter(x => x !== selectedA);
            filtered = filtered.filter(x => x !== selectedB);
            filtered = filtered.filter(x => x !== selectedC);
        } else return;

        let a = 0;

        if (gotchi === 'A' && (typeof selectedA !== 'undefined')) {
            a = selectedA;
            while (!filtered.includes(a)) {
                if (a < 0) a = userGotchis.length-1;
                else if (a > userGotchis.length-1) a = 0;
                else a += scrollValue;
            }
        }
        else if (gotchi === 'B' && (typeof selectedB !== 'undefined')) {
            a = selectedB;
            while (!filtered.includes(a)) {
                if (a < 0) a = userGotchis.length-1;
                else if (a > userGotchis.length-1) a = 0;
                else a += scrollValue;
            }
        }
        else if (gotchi === 'C' && (typeof selectedC !== 'undefined')) {
            a = selectedC;
            while (!filtered.includes(a)) {
                if (a < 0) a = userGotchis.length-1;
                else if (a > userGotchis.length-1) a = 0;
                else a += scrollValue;
            }
        }
        else console.log('handleScroll received bad gotchi ref string');

        if (a < 0) {
            setSelectedGotchi(gotchi, userGotchis.length-1)
        } else if (a > (userGotchis.length-1)) {
            setSelectedGotchi(gotchi, 0)
        } else {
            setSelectedGotchi(gotchi, a);
        }
    }

    // Render each of the scrollable gotchis here
    if (userGotchis && (selectedA !== undefined) && (selectedB !== undefined) && (selectedC !== undefined)) {
        return (
            <div>
                <div className={styles.selectTeam}>
                    <h1>Select your team</h1>
                </div>

                <div className={styles.aarcGotchiSelectorContainer}>
                    
                    {/* Selected Gotchi A container*/}
                    <div className={styles.selectedGotchiContainer}>
                        {/*Name & ID*/}
                        <div className={styles.nameAndId}>{userGotchis[selectedA].name}</div>
                        <div className={styles.nameAndId}>{userGotchis[selectedA].id}</div>
                        {/*SVG image and chevron buttons*/}
                        <div className={styles.chevronAndSVG}>
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degCW} 
                                onClick={() => handleScroll('A', -1)}/>
                            {/* <img className={styles.imgSVG} src={handleSVG(userGotchis[selectedA].svg)} alt='gotchi image'/> */}
                            {userGotchis ? (
                                <GotchiSVG tokenId={userGotchis[selectedA].id} options={{ animate: true, removeBg: true }}  />
                            ) : (
                                <img src={gotchiLoading} alt="Loading Aavegotchi" />
                            )}
                            
                            
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degACW} 
                                onClick={() => handleScroll('A', 1)}/>
                        </div>
                        {/*trait display*/}
                        <AarcTraitsPanel gotchi={userGotchis[selectedA]}/>
                        
                        {/*Show high scores*/}
                        <h1 className={styles.highscore}>
                            Highscore:
                            {' '}
                            {userGotchis && highscores?.find((score) => score.tokenId === userGotchis[selectedA]?.id)
                            ?.score || 0}
                        </h1>

                    </div>

                    {/* Selected Gotchi B container*/}
                    <div className={styles.selectedGotchiContainer}>
                        {/*Name & ID*/}
                        <div className={styles.nameAndId}>{userGotchis[selectedB].name}</div>
                        <div className={styles.nameAndId}>{userGotchis[selectedB].id}</div>
                        {/*SVG image and chevron buttons*/}
                        <div className={styles.chevronAndSVG}>
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degCW} 
                                onClick={() => handleScroll('B', -1)}/>
                            {/* <img className={styles.imgSVG} src={handleSVG(userGotchis[selectedB].svg)} alt='gotchi image'/> */}
                            {userGotchis ? (
                                <GotchiSVG tokenId={userGotchis[selectedB].id} options={{ animate: true, removeBg: true }}  />
                            ) : (
                                <img src={gotchiLoading} alt="Loading Aavegotchi" />
                            )}
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degACW} 
                                onClick={() => handleScroll('B', 1)}/>
                        </div>
                        {/*trait display*/}
                        <AarcTraitsPanel gotchi={userGotchis[selectedB]}/>
                        
                    </div>

                    {/* Selected Gotchi C container*/}
                    <div className={styles.selectedGotchiContainer}>
                        {/*Name & ID*/}
                        <div className={styles.nameAndId}>{userGotchis[selectedC].name}</div>
                        <div className={styles.nameAndId}>{userGotchis[selectedC].id}</div>
                        {/*SVG image and chevron buttons*/}
                        <div className={styles.chevronAndSVG}>
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degCW} 
                                onClick={() => handleScroll('C', -1)}/>
                            {/* <img className={styles.imgSVG} src={handleSVG(userGotchis[selectedC].svg)} alt='gotchi image'/> */}
                            {userGotchis ? (
                                <GotchiSVG tokenId={userGotchis[selectedC].id} options={{ animate: true, removeBg: true }}  />
                            ) : (
                                <img src={gotchiLoading} alt="Loading Aavegotchi" />
                            )}
                            <ChevronUp 
                                width={24} 
                                className={styles.chevronRotate90degACW} 
                                onClick={() => handleScroll('C', 1)}/>
                        </div>
                        {/*trait display*/}
                        <AarcTraitsPanel gotchi={userGotchis[selectedC]}/>
                        
                    </div>
                    
                </div>

            </div>
        )
    }
    else {
        return (
            <div>
                Nothing to see here
            </div>
        )
    }
};
