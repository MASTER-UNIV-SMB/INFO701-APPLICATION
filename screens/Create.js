import React, {Component} from 'react';
import {Dimensions, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import LoadingPage from '../components/primitives/LoadingPage';
import rand from 'random-seed';
import Screens from '../constants/Screens';
import {gameExpirationLength, gameIDLength} from '../constants/Structures';
import {modalStart} from '../constants/ModalContent';
import Events from '../constants/Events';
import Fire from '../Fire';
import {validateGame} from '../global/GlobalFunctions';

class Create extends Component {

    constructor(props) {
        super(props);

        this.state = {
            name: '',
            wordCount: '',
            error: '',
            disableButton: false,
            isModalVisible: false,
            isLoading: false,
            isAdLoaded: true,
            bypassAd: false,
        }
    }

    async componentDidMount() {
        this.db = Fire.db;
    }

    componentWillUnmount() {
        this.setState({
            name: '',
            wordCount: '',
            error: '',
            disableButton: false,
            isLoading: false,
            isAdLoaded: true,
            bypassAd: true
        })
    }

    async isNotValidGameID(id) {
        if (id === '') {
            return true;
        }

        try {
            let snapshot = await this.db.getRef(`games`).orderByKey().equalTo(id).once('value');

            return snapshot.val() != null;
        } catch {
            return true;
        }
    }

    makeGameID(length) {
        let id = '';

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let seededRandom = rand.create(Date.now());

        for (let i = 0; i < length; i++) {
            id += characters.charAt(Math.floor(seededRandom(characters.length)));
        }

        return id;
    }

    updateName(updatedName) {
        this.setState({name: updatedName});
    }

    updateWordCount(updateWordCount) {
        this.setState({wordCount: updateWordCount});
    }

    async cleanDatabase() {
        try {
            let gameExpiredTimestamp = Date.now() - gameExpirationLength;
            let gameRef = this.db.getRef('games');
            let oldGames = await gameRef.orderByChild("timestamp").endAt(gameExpiredTimestamp).once("value");

            console.log(`Les anciennes parties vont être supprimées : ${(new Date(gameExpiredTimestamp).toString())}`);

            if (oldGames.val() !== null) {
                const IDs = Object.keys(oldGames.val());
                let validGameIDs = [];

                IDs.forEach((ID) => {
                    if (validateGame(oldGames.val()[ID])) {
                        validGameIDs.push(ID);
                        console.log(`${ID}: ${(new Date(oldGames.val()[ID].timestamp)).toString()}`);
                    }
                })

                validGameIDs.forEach(validID => {
                    this.db.getRef(`games/${validID}`).remove();
                    this.db.getRef(`players/${validID}`).remove();
                    this.db.getRef(`words/${validID}`).remove();
                })
            }
        } catch (err) {
            console.log("Impossible de nettoyer la base de donnée")
            console.log(err)
        }
    }

    async pressSubmit() {
        Keyboard.dismiss();

        if (this.state.name.trim() < 1) {
            this.setState({error: `Veuillez entrer un pseudo !`});
            return
        } else if (isNaN(Number(this.state.wordCount))) {
            this.setState({error: `Le nombre de mots par personne doit être un nombre !`});
            return
        } else if (Number(this.state.wordCount) < 1) {
            this.setState({error: `Le nombre de mots par personne doit être supérieur à 1`});
            return
        } else if (Number(this.state.wordCount) > 10) {
            this.setState({error: `Le nombre de mots par personne doit être inférieur à 10`});
            return
        }

        this.setState({disableButton: true, isLoading: true});

        let newGameID = this.makeGameID(gameIDLength);
        while (await this.isNotValidGameID(newGameID)) {
            newGameID = this.makeGameID(gameIDLength);
        }
        this.db.logEvent(Events.CREATE_GAME, {
            screen: 'create',
            purpose: 'Créer une partie'
        })
        try {
            let gameRef = this.db.getRef('games');

            await gameRef.child(newGameID).set({
                'timestamp': Date.now(),
                'round': '',
                'wordsPerPerson': Number(this.state.wordCount),
                'status': Screens.LOBBY,
                'currentPlayer': '',
                'turnStartTimestamp': '',
                'score': {'team1': 0, 'team2': 0},
                'turnTime': 60000
            })

            let ref = await this.db.getRef(`players/${newGameID}`).push(this.state.name.trim())
            this.props.setPlayerID(ref.key)

            this.db.getRef(`games/${newGameID}/waiting/${ref.key}`).set(this.state.name.trim());
            this.db.getRef(`games/${newGameID}/host`).set({[ref.key]: this.state.name.trim()});
            this.props.updateName(this.state.name.trim());
            this.props.updateGameID(newGameID);
            await this.cleanDatabase();
            this.props.changeScreen(Screens.LOBBY);
        } catch (error) {
            this.setState({disableButton: false, isLoading: false});
            console.log('Erreur lors de la création : ' + error.message);
        }
    }

    render() {
        return (
            <LoadingPage
                loadingText={"Création de la partie..."}
                isLoading={this.state.isLoading}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <PrimaryModal
                            title="Création d'une partie"
                            modalVisible={this.state.isModalVisible}
                            buttonText='Ok !'
                            onCloseModal={() => this.setState({isModalVisible: false})}
                            minHeight={Dimensions.get('screen').height / 5}
                            content={
                                <Text style={styles.modalContent}>
                                    {modalStart.CREATE}
                                </Text>
                            }
                        />
                        <View style={styles.mainView}>
                            <Text style={styles.title}>Créer une partie</Text>
                            <View style={styles.errorBox}>
                                <Text style={styles.error}>{this.state.error}</Text>
                            </View>
                            <PrimaryTextInput
                                autoCorrect={false}
                                marginBottom={10}
                                onChangeText={text => this.updateName(text)}
                                placeholder={'Pseudo'}
                                value={this.state.name}
                            />
                            <PrimaryTextInput
                                autoCorrect={false}
                                keyboardType={'number-pad'}
                                onChangeText={text => this.updateWordCount(text)}
                                placeholder={'Nombre de mots par personne'}
                                value={this.state.wordCount}
                            />
                            <PrimaryButton
                                text={'Créer'}
                                onPress={() => this.pressSubmit()}
                                disabled={this.state.disableButton}
                            />
                            <TouchableOpacity
                                style={styles.questionTag}
                                onPress={() => this.setState({isModalVisible: true})}
                            >
                                <Text style={styles.questionTagText}>Besoin d'aide ?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.backButtonView}>
                            <BackButton
                                onPress={() => {
                                    this.db.logEvent(Events.BACK_BUTTON, {
                                        screen: 'create',
                                        purpose: 'L\'utilisateur sur la page de création a cliqué pour revenir au lobby'
                                    })
                                    this.props.changeScreen(Screens.HOME)
                                }}
                                margin={Dimensions.get('screen').width / 15}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </LoadingPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainView: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    title: {
        fontSize: Dimensions.get('screen').height / 30,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        marginBottom: 10,
    },
    backButtonView: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    errorBox: {
        minHeight: Dimensions.get('screen').height / 15,
        maxHeight: Dimensions.get('screen').height / 15,
        minWidth: '85%',
        maxWidth: '85%',
    },
    error: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#c46363',
        textAlign: 'center'
    },
    questionTag: {
        marginTop: 15,
        paddingLeft: Dimensions.get('screen').width / 15,
        paddingRight: Dimensions.get('screen').width / 15,
        minWidth: '85%',
        maxWidth: '85%',
    },
    questionTagText: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#ffffff66',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    modalContent: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#ffffffaa',
        textAlign: 'left'
    }
});

export default Create;
