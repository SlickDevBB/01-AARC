import { useCallback, useEffect, useState } from 'react';
import {
  Layout, GotchiSelector, 
  DetailsPanel, Modal, Title, 
  AarcGotchiSelector, GotchiSVG,
} from 'components';
import { Link } from 'react-router-dom';
import globalStyles from 'theme/globalStyles.module.css';
import { useServer } from 'server-store';
import { useWeb3, updateAavegotchis } from 'web3/context';
import { getDefaultGotchi } from 'helpers/aavegotchi';
import gotchiLoading from 'assets/gifs/loading.gif';
import { playSound } from 'helpers/hooks/useSound';
import styles from './styles.module.css';

const Home = () => {

  const {
    state: {
      usersAavegotchis, 
      address, 
      selectedAavegotchiIndexA, 
      selectedAavegotchiIndexB, 
      selectedAavegotchiIndexC, 
      networkId,
    },
    dispatch,
  } = useWeb3();

  // const { highscores } = useServer();
  const [showRulesModal, setShowRulesModal] = useState(false);


  const useDefaultGotchi = () => {
    dispatch({ type: "SET_USERS_AAVEGOTCHIS", usersAavegotchis: [getDefaultGotchi()]});
  }

  /**
   *Updates global state with three aarc gotchis
   */ 
   const handleAarcSelect = useCallback(
    (gotchiIndexA: number, gotchiIndexB: number, gotchiIndexC: number) => {
      dispatch({ type: "SET_SELECTED_AAVEGOTCHIS", 
        selectedAavegotchiIndexA: gotchiIndexA,
        selectedAavegotchiIndexB: gotchiIndexB,
        selectedAavegotchiIndexC: gotchiIndexC, });
    }, [dispatch],
  );

  // this use effect is only interested in loading user gotchis from given contract
  useEffect(() => {
    if (process.env.REACT_APP_OFFCHAIN) return useDefaultGotchi();

    if (address) {
      updateAavegotchis(dispatch, address);
    }
  }, [ address ]);


  /////////////////
  // Render code //
  /////////////////

  console.log(networkId);

  // JSX if error
  if (networkId !== 137) {
    return (
      <Layout>
        <div className={globalStyles.container}>
          <div className={styles.errorContainer}>
            <h1>Wrong network.</h1>
            <p className={styles.secondaryErrorMessage}>
              Please connect to the Polygon network.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  if (usersAavegotchis && usersAavegotchis?.length <= 0) {
    return (
      <Layout>
        <div className={globalStyles.container}>
          <div className={styles.errorContainer}>
            <p>No Aavegotchis found for address - Please make sure the correct wallet is connected.</p>
            <p className={styles.secondaryErrorMessage}>
              Don’t have an Aavegotchi? Visit the Baazaar to get one.
            </p>
            <a
              href="https://aavegotchi.com/baazaar/portals-closed?sort=latest"
              target="__blank"
              className={globalStyles.primaryButton}
            >
              Visit Bazaar
            </a>
            {/* Allows developers to build without the requirement of owning a gotchi */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={useDefaultGotchi}
                className={globalStyles.primaryButton}
              >
                Use Default Gotchi
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // JSX if no errors
  return (
    <Layout>

      {/*The modal is where the game story, rules and quick tutorial are stored*/}
      {/*The modal will only show when setShowModal is changed */}
      {showRulesModal && (
        <Modal onHandleClose={() => setShowRulesModal(false)}>
          <div className={styles.modalContent}>
            <h1>Minigame Template</h1>
            <p>
              Just a modal test. You can put your game rules in here.
            </p>
          </div>
        </Modal>
      )}

      {/*globalStyles container is everything below the header*/}
      <div className={globalStyles.container}>
        <div className={styles.homeContainer}>
          {/*These next two buttons are for starting the game and showing the modal */}
          {/*note we need to have a selected gotchi for the battle link to work*/}
          <div className={styles.buttonContainer}>
            <Link
              to="/play"
              className={`${globalStyles.primaryButton} ${
                !selectedAavegotchiIndexA ? globalStyles.disabledLink : ''
              }`}
              onClick={() => playSound('send')}
            >
              BATTLE
            </Link>
            <button
              onClick={() => {
                playSound('click');
                setShowRulesModal(true);
              }}
              className={`${globalStyles.secondaryButton} ${globalStyles.circleButton}`}
            >
              ?
            </button>
          </div>

          {/*This is my custom gotchi selector component*/}
          <AarcGotchiSelector
            userGotchis={usersAavegotchis}
            initialGotchiIndexA={selectedAavegotchiIndexA}
            initialGotchiIndexB={selectedAavegotchiIndexB}
            initialGotchiIndexC={selectedAavegotchiIndexC}
            selectAarcGotchis={handleAarcSelect}
          />

        </div>
      </div>

    </Layout>
  );
};

export default Home;
