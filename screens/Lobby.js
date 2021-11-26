import React, {Component} from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import SegmentSelector from '../components/primitives/SegmentSelector';
import PrimaryButton from '../components/primitives/PrimaryButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import InstructionsModal from '../components/segments/InstructionsModal';
import YourWords from '../components/segments/YourWords';
import Screens from '../constants/Screens';
import NumberRanks from '../constants/NumberRanks';
import {getCurrentTimestamp, isValidSnapshot} from '../global/GlobalFunctions';
import {gameStorageValue} from '../constants/FirestoreValues';
import Events from '../constants/Events';
import {DEV} from '../constants/Mode';
import {errorContent, hostLeftContent} from '../constants/Content';
import Fire from '../Fire';
import _ from 'lodash';

const playerMinLimit = DEV ? 2 : 4

class Lobby extends Component {
    state = {
        editWords: true,
        error: '',
        host: {name: null, id: null},
        players: [['', '']],
        waitingPlayerKeys: [],
        words: [
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''},
            {key: '', word: ''}
        ],
        wordCount: 0,
        wordsPerPlayer: 0,
        currentSegment: 'Vos mots',
        disableSubmitWords: false,
        disableLeaveGame: false,
        disableContinue: false,
        showHostModal: true,
        showInstructions: false,
        showConfirmLeave: false,
        wasHost: false,
    }

    componentDidMount() {
        this.db = Fire.db;

        if (this.props.playerID === '') {
            this.db.getRef('players/' + this.props.gameID).push(this.props.screenName).then((value) => {
                this.props.setPlayerID(value.key)
                this.db.getRef(`games/${this.props.gameID}/waiting/${value.key}`).set(this.props.screenName);
            });
        }

        this.db.getRef(`games/${this.props.gameID}/wordsPerPerson`).once('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 12)) return
            if (typeof snapshot.val() === 'number') {
                this.setState({wordsPerPlayer: snapshot.val()})
            }
        })

        this.db.getRef(`games/${this.props.gameID}/host`).on('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 0)) {
                this.props.setHomeMessage(errorContent(0))
                this.props.changeScreen(Screens.HOME);
                return
            }

            if (snapshot.val() === "") {
                if (!this.state.wasHost) {
                    this.props.setHomeMessage(hostLeftContent);
                    this.goHome();
                }
            } else {
                let host = Object.entries(snapshot.val())[0];
                this.setState({host: {name: host[1], id: host[0]}});

                if (this.props.playerID === host[0]) {
                    this.setState({wasHost: true});
                }
            }
        });

        this.db.getRef('players/' + this.props.gameID).on('value', (snapshot) => {
            let dbPlayers = _.toPairs(snapshot.val());

            this.setState({players: [...dbPlayers]});
        });

        this.db.getRef('words/' + this.props.gameID).on('value', (snapshot) => {
            let words = _(snapshot.val()).values();
            let count = [...words].length;

            this.setState({wordCount: count});
        });

        this.db.getRef(`games/${this.props.gameID}/waiting`).on('value', (snapshot) => {
            let waiting = _(snapshot.val()).keys();

            this.setState({waitingPlayerKeys: [...waiting]});
        });

        this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
            if (snapshot.val() === Screens.TEAMS) {
                this.props.changeScreen(Screens.TEAMS);
            }
        });
    }

    componentWillUnmount() {
        this.db.getRef(`players/${this.props.gameID}`).off();
        this.db.getRef(`words/${this.props.gameID}`).off();
        this.db.getRef(`games/${this.props.gameID}/waiting`).off();
        this.db.getRef(`games/${this.props.gameID}/status`).off();
        this.db.getRef(`games/${this.props.gameID}/host`).off();

        this.setState({
            disableSubmitWords: false,
            disableLeaveGame: false,
            disableContinue: false,
        })
    }

    async goHome() {
        this.setState({disableLeaveGame: true});
        this.db.logEvent(Events.LEAVE_GAME, {
            screen: 'lobby',
            purpose: 'Le bouton Quitter le jeu a été cliqué',
        })

        this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
            .then(() => {
                console.log(`${this.props.playerID} (${this.props.screenName}) a été expulsé de la partie`);
                this.removeUserWaiting();
                this.removeUserWords();
                this.resetHost();
                this.checkIfLastToLeave();
            })
            .catch((error) => 'Erreur lors de l\'expulsion: ' + error.message)
            .finally(() => {
                this.props.changeScreen(Screens.HOME)
            });
    }

    async resetHost() {
        if (this.props.playerID === this.state.host.id) {
            try {
                await this.db.getRef(`games/${this.props.gameID}/host`).set('')
            } catch (err) {
                console.log("Impossible de réinitialiser l'hôte : " + err)
            }
        }
    }

    async removeUserWaiting() {
        this.db.getRef(`games/${this.props.gameID}/waiting/${this.props.playerID}`).remove().then(() => {
            console.log(`${this.props.playerID} (${this.props.screenName}) a été retiré de l'attente`);
        })
            .catch((error) => 'Erreur: ' + error.message)
    }

    async removeUserWords() {
        let currentWords = this.state.words;
        for (let i = 0; i < this.state.wordsPerPlayer; i++) {
            this.db.getRef(`words/${this.props.gameID}/${currentWords[i].key}`).remove()
                .then(() => {
                    console.log(`Le mot (${currentWords[i].word}) a été retiré`);
                })
                .catch((error) => 'Erreur lors de la supression du mot : ' + error.message)
        }
    }

    async checkIfLastToLeave() {
        this.db.getRef(`players`).orderByKey().equalTo(this.props.gameID).once('value', (snapshot) => {
            if (snapshot.val() == null) {
                console.log(`${this.props.screenName} est le dernier joueur a quitter`);
                this.deleteGame();
                this.deleteGameWords();
            }
        });
    }

    async deleteGame() {
        this.db.getRef(`games/${this.props.gameID}`).remove().then(() => {
            console.log(`La partie (${this.props.gameID}) a été supprimé`);
        }).catch((error) => 'Erreur lors de la suppresison de la partie : ' + error.message);
    }

    async deleteGameWords() {
        this.db.getRef(`words/${this.props.gameID}`).remove().then(() => {
            console.log(`Les mots de la partie (${this.props.gameID}) ont été supprimés`);
        }).catch((error) => 'Erreur : ' + error.message);
    }

    updateWord(text, index) {
        this.setState(prevState => {
            let newWords = [...prevState.words];
            newWords[index].word = text;
            return {words: newWords};
        });
    }

    submitWords() {
        for (let i = 0; i < this.state.wordsPerPlayer; i++) {
            if (this.state.words[i].word.trim() === '') {
                this.setState({error: "Remplissez tout les mots !"});

                this.db.logEvent(Events.SUBMIT_WORDS, {
                    screen: 'lobby',
                    purpose: "L'utilisateur a cliqué pour soumettre un mot mais il n'a pas rempli tout les champs !",
                    status: 'invalid'
                })

                return;
            }
        }

        this.setState({disableSubmitWords: true});
        this.db.logEvent(Events.SUBMIT_WORDS, {
            screen: 'lobby',
            purpose: 'L\'utilisateur a cliqué pour soumettre ses mots',
            status: 'valid'
        })

        this.setState({error: ''});
        if (this.state.words[0].key !== '') {
            for (let i = 0; i < this.state.wordsPerPlayer; i++) {
                this.db.getRef(`words/${this.props.gameID}/${this.state.words[i].key}`).update({
                    word: this.state.words[i].word.trim().toUpperCase()
                })
            }
        } else {
            let gameWordsRef = this.db.getRef('words/' + this.props.gameID);

            for (let i = 0; i < this.state.wordsPerPlayer; i++) {
                let wordRef = gameWordsRef.push({
                    word: this.state.words[i].word.trim().toUpperCase(),
                    hasBeenPlayed: false
                });

                this.setState(prevState => {
                    let newWords = [...prevState.words];
                    newWords[i].key = wordRef.key;

                    return {words: newWords};
                })
            }

            this.db.getRef(`games/${this.props.gameID}/waiting/${this.props.playerID}`).remove().then(() => console.log(`Attente de ${this.props.playerID} (${this.props.screenName}) terminée`))
        }

        this.setState({
            disableSubmitWords: false,
            editWords: false,
            currentSegment: 'Joueurs'
        });

        this.setState((prevState) => {
            let newWords = [...prevState.words];
            for (let i = 0; i < newWords.length; i++) {
                newWords[i].word = newWords[i].word.trim()
            }
            return {
                editWords: false,
                words: newWords
            }
        })
    }

    startGame() {
        this.db.logEvent(Events.START_GAME, {
            screen: 'lobby',
            purpose: 'Lancement de la partie et repartition des équipes',
        })

        this.setState({disableSubmitWords: true});
        this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.TEAMS).then(async () => {
            this.db.getRef(`players/${this.props.gameID}`).once('value', (snapshot) => {
                if (!isValidSnapshot(snapshot, 1)) {
                    this.props.setHomeMessage(errorContent(1))
                    this.props.changeScreen(Screens.HOME);
                    return
                }

                let gamePlayers = Object.entries(snapshot.val());
                gamePlayers.sort(() => Math.random() - 0.5);
                let playersWithTeams = {};

                for (let i = 0; i < gamePlayers.length; i++) {
                    let teamNumber = i % 2 === 0 ? 0 : 1;
                    let playerObject = {
                        name: gamePlayers[i][1],
                        team: teamNumber,
                        hasPlayed: false,
                        points: 0,
                    }
                    playersWithTeams[gamePlayers[i][0]] = playerObject;
                }

                this.db.getRef(`players/${this.props.gameID}`).update(playersWithTeams);
            });

            const playerNames = this.state.players.map(player => player[1])
            let allWords = []
            try {
                const rawWords = await this.db.getRef(`words/${this.props.gameID}`).once('value')
                allWords = Object.values(rawWords.val()).map(wordObj => wordObj.word)
            } catch {
                console.log('Erreur')
            }

            this.db.getCollection(gameStorageValue).doc(`${this.props.gameID}${this.props.playerID}`).set({
                playerCount: this.state.players.length,
                wordCount: this.state.players.length * this.state.wordsPerPlayer,
                timeStart: getCurrentTimestamp(),
                timeFinish: null,
                didFinish: false,
                players: playerNames,
                words: allWords,
                host: this.props.screenName
            }).then(() => console.log('Report de la partie sur l\'historique'))
                .catch(err => console.log(err))
        })
            .catch((error) => {
                console.log(`Erreur lors du lancement de la partie ${this.props.GameID}`)
                console.log(error)
            })
    }

    getWaitingToJoinText() {
        if (this.state.players.length < playerMinLimit) {
            const playerPlural = (playerMinLimit - this.state.players.length) === 1 ? 'joueur' : 'joueurs'
            return `Encore ${" " + String(playerMinLimit - this.state.players.length) + " "} ${playerPlural} pour lancer la partie...`
        }
        return null
    }

    render() {
        let playerList = (
            <ScrollView style={styles.playerList}>
                {this.state.players.map((player, i) => {
                    let playerState = this.state.waitingPlayerKeys.includes(player[0]) ? 'En attente...' : 'Prêt';
                    let suffix = player[0] === this.props.playerID ? ' (Toi)' : null;
                    return (
                        <View key={i} style={styles.playerItem}>
                            <Text style={styles.playerName}>{player[1]}{suffix}</Text>
                            {playerState === 'En attente...'
                                ? <Text style={styles.playerWaiting}>{playerState}</Text> : null}
                            {playerState === 'Prêt !'
                                ? <Text style={styles.playerReady}>{playerState}</Text> : null}
                        </View>
                    );
                })}
            </ScrollView>
        );

        let yourWords = this.state.editWords
            ? <YourWords
                words={this.state.words}
                wordsPerPlayer={this.state.wordsPerPlayer}
                onWordChange={(text, wordNum) => this.updateWord(text, wordNum)}
                onSubmit={() => this.submitWords()}
                error={this.state.error}
                style={styles.textInput}
                placeholderTextColor='#eeeeee'
                footerHeight={Dimensions.get('screen').height / 7}
                disabled={this.state.disableContinue}
            /> : (
                <ScrollView>
                    <View style={styles.myWords}>
                        {this.state.words.map((wordObject, i) => {
                            if (i < this.state.wordsPerPlayer) {
                                return (
                                    <Text
                                        key={NumberRanks[i]}
                                        style={styles.myWord}
                                    >
                                        {wordObject.word}
                                    </Text>)
                            }
                        })}
                        <PrimaryButton
                            text='Modifier les mots'
                            onPress={() => {
                                this.db.logEvent(Events.EDIT_WORDS, {
                                    screen: 'lobby',
                                    purpose: 'Le joueur veut éditer ses mots'
                                })

                                this.setState({editWords: true})
                            }}
                            buttonStyle={styles.editButton}
                            textStyle={styles.editButtonText}
                        />
                    </View>
                </ScrollView>
            )

        let morePane = (
            <View style={styles.moreView}>
                <PrimaryButton
                    text='Comment jouer ?'
                    onPress={() => this.setState({showInstructions: true})}
                    buttonStyle={styles.instructionsButton}
                />
                <PrimaryButton
                    text='Quitter la partie'
                    onPress={() => this.setState({showConfirmLeave: true})}
                    buttonStyle={styles.leaveButton}
                    textStyle={styles.leaveButtonText}
                    disabled={this.state.disableLeaveGame}
                />
            </View>
        )

        const playerPlural = this.state.players.length === 1
            ? 'joueur' : 'joueurs'

        return (
            <View style={styles.container}>
                <InstructionsModal
                    onCloseModal={() => this.setState({showInstructions: false})}
                    modalVisible={this.state.showInstructions}
                />
                <PrimaryModal
                    title='Inviter des joueurs'
                    modalVisible={
                        this.props.playerID === this.state.host.id &&
                        this.state.showHostModal}
                    buttonText={'Ok !'}
                    onCloseModal={() => this.setState({showHostModal: false})}
                    minHeight={Dimensions.get('screen').height / 5}
                    content={
                        <View style={styles.modalContent}>
                            <View style={styles.modalCode}>
                                <Text style={styles.modalCodeText} selectable>
                                    {this.props.gameID}
                                </Text>
                            </View>
                            <Text style={styles.modalText}>
                              Partagez le code ci-dessus avec d'autres joueurs pour qu'ils puissent rejoindre la partie !
                            </Text>
                        </View>
                    }
                />
                <PrimaryModal
                    title='Es-tu sûr ?'
                    modalVisible={this.state.showConfirmLeave}
                    twoButtons
                    buttonText={'Quitter'}
                    onCancel={() => this.setState({showConfirmLeave: false})}
                    onCloseModal={() => this.goHome()}
                    minHeight={Dimensions.get('screen').height / 5}
                    titleHeight={Dimensions.get('screen').height / 26}
                    content={
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>
                                {this.props.playerID === this.state.host.id
                                    ? "Quitter le jeu en tant qu'hôte mettra fin à la partie pour tout le monde !"
                                    : "Quitter le jeu c'est pas cool !"}
                            </Text>
                        </View>
                    }
                />
                <View style={styles.header}>
                    <Text style={styles.title}>Lobby</Text>
                    <Text style={styles.subtitle}>{this.props.gameID}</Text>
                    <Text style={styles.minititle}>
                        {this.state.wordCount}/{this.state.players.length * this.state.wordsPerPlayer} mots
                    </Text>
                    <Text style={styles.minititle}>
                        {`${this.state.players.length} ${playerPlural}`}
                    </Text>
                </View>
                <SegmentSelector
                    segments={['Vos mots', 'Joueurs', 'Plus...']}
                    currentSegment={this.state.currentSegment}
                    onChangeSegment={segment => {
                        this.db.logEvent(Events.SWITCH_TAB, {
                            tab: segment,
                            screen: 'lobby',
                            purpose: "Le joueur a changé d'onglet"
                        })
                        this.setState({currentSegment: segment})
                    }}
                />
                <View style={styles.body}>
                    {this.state.currentSegment === 'Vos mots' ? yourWords : null}
                    {this.state.currentSegment === 'Joueurs' ? playerList : null}
                    {this.state.currentSegment === 'Plus...' ? morePane : null}
                </View>
                <View style={styles.footer}>
                    {this.state.players.length < playerMinLimit
                        ? <Text style={styles.footerText}>{this.getWaitingToJoinText()}</Text>
                        : this.state.wordCount < this.state.players.length * this.state.wordsPerPlayer
                            ? <Text style={styles.footerText}>Attendez que les joueurs soumettent leurs mots...</Text>
                            : this.props.playerID === this.state.host.id
                                ? <PrimaryButton
                                    text='Continue'
                                    onPress={() => this.startGame()}
                                    buttonStyle={styles.continueButton}
                                    textStyle={styles.continueButtonText}
                                    disabled={this.state.disableContinue}
                                />
                                : <Text style={styles.footerText}>En attente de l'hôte...</Text>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },
    modalContent: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    modalCode: {
        backgroundColor: '#3c34d9',
        borderRadius: Dimensions.get('screen').height,
        paddingTop: 3,
        paddingLeft: 30,
        paddingRight: 30,
        width: '100%'
    },
    modalCodeText: {
        color: '#ffffff',
        fontSize: Dimensions.get('screen').height / 25,
        fontFamily: 'poppins-semibold',
        textAlign: 'center',
        width: '100%'
    },
    modalText: {
        fontSize: Dimensions.get('screen').height / 45,
        fontFamily: 'poppins-semibold',
        color: '#ffffffaa',
        textAlign: 'center',
        marginTop: 10,
    },
    header: {
        flex: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#121212',
        minWidth: '100%'
    },
    title: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        marginTop: 15,
    },
    subtitle: {
        fontSize: Dimensions.get('screen').height / 35,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        marginBottom: 10,
    },
    minititle: {
        fontSize: Dimensions.get('screen').height / 55,
        fontFamily: 'poppins-semibold',
        color: '#ffffffaa',
    },
    body: {
        display: 'flex',
        flexDirection: 'column',
        flex: 4,
        backgroundColor: '#272727',
        minWidth: '100%',
    },
    myWords: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 10,
    },
    myWord: {
        fontSize: Dimensions.get('screen').height / 30,
        fontFamily: 'poppins-semibold',
        color: '#fff',
    },
    moreView: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%',
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 10,
    },
    leaveButton: {
        backgroundColor: '#474747',
        minWidth: '20%',
        maxWidth: '80%',
        width: '80%',
        height: Dimensions.get('screen').height / 18,
        margin: 0,
        marginTop: 15
    },
    leaveButtonText: {
        color: '#f17c7c',
    },
    instructionsButton: {
        backgroundColor: '#474747',
        minWidth: '20%',
        maxWidth: '80%',
        height: Dimensions.get('screen').height / 18,
        width: '80%',
        marginTop: 15,
        margin: 0,
    },
    editButton: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#4b42f5',
        minWidth: '60%',
        maxWidth: '60%',
        height: Dimensions.get('screen').height / 15,
        marginTop: 15
    },
    editButtonText: {
        color: '#4b42f5',
    },
    footer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#4b42f5',
        minWidth: '100%',
        paddingLeft: 10,
        paddingRight: 10,
    },
    footerText: {
        fontSize: Dimensions.get('screen').height / 60,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        textAlign: 'center'
    },
    continueButton: {
        backgroundColor: '#4b42f5',
        borderWidth: 2,
        borderColor: '#ffffff',
        height: Dimensions.get('screen').height / 30,
    },
    continueButtonText: {
        color: '#ffffff',
    },
    textInput: {
        color: '#fff',
        backgroundColor: '#474747',
        height: Dimensions.get('screen').height / 15,
    },
    playerList: {
        padding: 15,
    },
    playerItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: "#474747"
    },
    playerName: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#fff',
    },
    playerWaiting: {
        fontSize: Dimensions.get('screen').height / 45,
        fontFamily: 'poppins-italic',
        color: '#aaa',
    },
    playerReady: {
        fontSize: Dimensions.get('screen').height / 40,
        fontFamily: 'poppins-semibold',
        color: '#54ad18',
    }
});

export default Lobby;
