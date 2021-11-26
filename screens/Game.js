import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import Screens from '../constants/Screens';
import Timer from '../components/primitives/Timer';
import Events from '../constants/Events';
import Fire from '../Fire';
import UserPlaying from '../components/segments/UserPlaying';
import OpponentPlaying from '../components/segments/OpponentPlaying';
import PrimaryModal from '../components/primitives/PrimaryModal';
import InstructionsModal from '../components/segments/InstructionsModal';
import {modalContentPlaying, modalContentWatching, modalSubtitles, modalTitles} from '../constants/ModalContent';
import {getCurrentTimestamp, isValidSnapshot} from '../global/GlobalFunctions';
import {gameStorageValue} from '../constants/FirestoreValues';
import {errorContent, hostLeftContent} from '../constants/Content';

class Game extends Component {

    state = {
        isPlaying: false,
        isTeamPlaying: false,
        currentPlayer: {},
        players: [],
        score: {team1: 0, team2: 0},
        words: [{id: '', word: ''}],
        currentWord: {id: '', word: ''},
        round: 0,
        isTimerGoing: false,
        turnStartTimestamp: '',
        turnTime: 60000,
        timeRemaining: 60000,
        isModalVisible: false,
        showInstructions: false,
        host: {name: '', id: ''}
    }

    componentDidMount() {
        this.db = Fire.db;

        if (this.props.team !== 0 && this.props.team !== 1) {
            this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}/team`).once('value', (snapshot) => {
                if (!isValidSnapshot(snapshot, 10)) {
                    this.props.setHomeMessage(errorContent(10))
                    this.props.changeScreen(Screens.HOME);
                    return
                }
                this.props.updateTeam(snapshot.val());
            })
        }

        this.db.getRef(`games/${this.props.gameID}/currentPlayer`).on('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 4)) {
                this.props.setHomeMessage(errorContent(4))
                this.props.changeScreen(Screens.HOME);
                return
            }

            let currentPlayer = Object.entries(snapshot.val())[0];

            let currentPlayerStateObj = {
                id: currentPlayer[0],
                name: currentPlayer[1].name,
                team: currentPlayer[1].team,
            }

            const isPlayingState = currentPlayerStateObj.id === this.props.playerID;
            const isTeamPlayingState = currentPlayerStateObj.team === this.props.team;

            this.setState({
                isPlaying: isPlayingState,
                isTeamPlaying: isTeamPlayingState,
                currentPlayer: currentPlayerStateObj,
                timeRemaining: 60000
            })

            if (isPlayingState) {
                this.getAvailableWords();
            }
        });

        this.db.getRef(`players/${this.props.gameID}`).on('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 11)) {
                this.props.setHomeMessage(errorContent(11))
                this.props.changeScreen(Screens.HOME);
                return
            }

            const allPlayers = Object.entries(snapshot.val());
            let gamePlayers = [];
            for (let i = 0; i < allPlayers.length; i++) {
                const suffix = this.props.playerID === allPlayers[i][0] ? ' (Vous)' : ''
                const gamePlayer = {
                    id: allPlayers[i][0],
                    name: allPlayers[i][1].name + suffix,
                    team: allPlayers[i][1].team,
                    points: allPlayers[i][1].points,
                }

                gamePlayers.push(gamePlayer)
            }

            this.setState({players: gamePlayers})
        });

        this.db.getRef(`games/${this.props.gameID}/score`).on('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 5)) {
                this.props.setHomeMessage(errorContent(5))
                this.props.changeScreen(Screens.HOME);
                return
            }

            let scores = Object.entries(snapshot.val());

            let team1Score = 0;
            let team2Score = 0;

            for (let i = 0; i < scores.length; i++) {
                if (scores[i][0] === 'team1') {
                    team1Score = scores[i][1]
                } else if (scores[i][0] === 'team2') {
                    team2Score = scores[i][1]
                }
            }

            this.setState({score: {team1: team1Score, team2: team2Score}});
        });

        this.db.getRef(`games/${this.props.gameID}/round`).on('value', (snapshot) => {
            let roundState = snapshot.val();
            this.setState({round: roundState, isModalVisible: true, showInstructions: false});
        });

        this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).on('value', (snapshot) => {
            let turnStart = snapshot.val();
            let timerStarted = turnStart === '' ? false : true;
            this.setState({
                turnStartTimestamp: turnStart,
                isTimerGoing: timerStarted
            }, () => {
                if (timerStarted) {
                    this.myInterval = setInterval(() => this.countdown(), 100)
                }
            });
        });

        this.db.getRef(`games/${this.props.gameID}/turnTime`).on('value', (snapshot) => {
            clearInterval(this.myInterval);
            let turnTimeState = snapshot.val();
            this.setState({turnTime: turnTimeState});
        });

        this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
            if (snapshot.val() === Screens.FINISH) {
                this.props.changeScreen(Screens.FINISH);

                this.db.logEvent(Events.FINISH_GAME, {
                    purpose: 'Le joueur a terminé la partie',
                })

                if (this.props.playerID === this.state.host.id) {
                    this.db.getCollection(gameStorageValue).doc(`${this.props.gameID}${this.props.playerID}`).update({
                        timeFinish: getCurrentTimestamp(),
                        didFinish: true
                    }).then(() => console.log('Stockage de la partie réussie !')).catch(err => console.log(err))
                }
            }
        });

        this.db.getRef(`games/${this.props.gameID}/host`).on('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 13)) {
                this.props.setHomeMessage(errorContent(13))
                this.props.changeScreen(Screens.HOME);
                return
            }

            if (snapshot.val() === "") {
                this.props.setHomeMessage(hostLeftContent);
                this.props.changeScreen(Screens.HOME);
            } else {
                let host = Object.entries(snapshot.val())[0];
                this.setState({host: {name: host[1], id: host[0]}});
            }
        });
    }

    componentWillUnmount() {
        this.db.getRef(`games/${this.props.gameID}/currentPlayer`).off();
        this.db.getRef(`games/${this.props.gameID}/score`).off();
        this.db.getRef(`games/${this.props.gameID}/round`).off();
        this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).off();
        this.db.getRef(`games/${this.props.gameID}/turnTime`).off();
        this.db.getRef(`games/${this.props.gameID}/status`).off();
        this.db.getRef(`games/${this.props.gameID}/host`).off();
        this.db.getRef(`players/${this.props.gameID}`).off();
        clearInterval(this.myInterval);
    }

    getAvailableWords() {
        this.db.getRef(`words/${this.props.gameID}`).once('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 6)) {
                this.props.setHomeMessage(errorContent(6))
                this.props.changeScreen(Screens.HOME);
                return
            }

            const allWords = Object.entries(snapshot.val());
            let availableWords = [];

            for (let i = 0; i < allWords.length; i++) {
                if (!allWords[i][1].hasBeenPlayed) {
                    availableWords.push({
                        id: allWords[i][0],
                        word: allWords[i][1].word
                    });
                }
            }

            availableWords.sort(() => Math.random() - 0.5);

            this.setState({words: availableWords, currentWord: availableWords[0]});
        })
    }

    getTeam(team) {
        return team === 0 ? "team1" : "team2";
    }

    wordHasBeenPlayed() {
        this.db.getRef(`words/${this.props.gameID}/${this.state.currentWord.id}`).update({hasBeenPlayed: true});

        let availableWords = [...this.state.words];
        availableWords.shift();

        if (availableWords.length === 0) {
            this.nextRound();
        } else {
            this.setState({words: availableWords, currentWord: availableWords[0]});
        }
    }

    nextRound() {
        this.setState({isTimerGoing: false});

        this.db.getRef(`games/${this.props.gameID}`).update({
            turnTime: this.state.timeRemaining,
            turnStartTimestamp: ''
        })

        if (this.state.round === 3) {
            this.db.getRef(`games/${this.props.gameID}/status`).set(Screens.FINISH);
        } else {
            this.db.getRef(`games/${this.props.gameID}/round`).set(this.state.round + 1);
            this.db.getRef(`words/${this.props.gameID}`).once('value', (snapshot) => {
                if (!isValidSnapshot(snapshot, 7)) {
                    this.props.setHomeMessage(errorContent(7))
                    this.props.changeScreen(Screens.HOME);
                    return
                }

                let allWords = Object.entries(snapshot.val());
                let updatedWords = {};

                for (let i = 0; i < allWords.length; i++) {
                    updatedWords[allWords[i][0]] = {
                        hasBeenPlayed: false,
                        word: allWords[i][1].word
                    }
                }

                this.db.getRef(`words/${this.props.gameID}`).update(updatedWords).then(() => {
                    this.getAvailableWords()
                })
            })
        }
    }

    nextWord() {
        this.db.logEvent(Events.NEXT_WORD, {
            screen: 'game',
            purpose: 'Le joueur a cliqué sur le bouton suivant pour obtenir le mot suivant',
        })

        let team = this.getTeam(this.props.team);
        let newScore = this.state.score[team] + 1;

        this.db.getRef(`games/${this.props.gameID}/score/${team}`).set(newScore);

        this.wordHasBeenPlayed();
        this.updatePersonalPoints(1);
    }

    pass() {
        this.db.logEvent(Events.PASS_WORD, {
            screen: 'game',
            purpose: 'Le joueur a cliqué sur le bouton de validation pour passer le mot',
        })

        let team = this.getTeam(this.props.team) === "team1" ? "team2" : "team1";
        let newScore = this.state.score[team] + 1;

        this.db.getRef(`games/${this.props.gameID}/score/${team}`).set(newScore);

        this.wordHasBeenPlayed();
        this.updatePersonalPoints(-1);
    }

    async updatePersonalPoints(amt) {
        try {
            const score = await this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}/points`).once('value')
            this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}/points`).set(score.val() + amt);
        } catch (error) {
            console.log('Échec de la mise à jour du score')
        }
    }

    setTimer(setValue, time) {
        if (setValue) {
            this.setState({isTimerGoing: setValue, turnStartTimestamp: time})
            this.db.getRef(`games/${this.props.gameID}/turnStartTimestamp`).set(time);
        } else {
            this.setState({isTimerGoing: setValue, turnStartTimestamp: ''})
        }
    }

    countdown() {
        let timeLeft = (this.state.turnStartTimestamp + this.state.turnTime) - Date.now();
        timeLeft = timeLeft < 0 ? 0 : timeLeft;

        this.setState({timeRemaining: timeLeft})

        if (timeLeft === 0) {
            clearInterval(this.myInterval);
            this.setState({isTimerGoing: false, turnTime: 60000});

            if (this.state.isPlaying) {
                this.db.getRef(`games/${this.props.gameID}`).update({
                    turnStartTimestamp: '',
                    turnTime: 60000
                });

                this.db.getRef(`players/${this.props.gameID}`).once('value', (snapshot) => {
                    if (!isValidSnapshot(snapshot, 8)) {
                        this.props.setHomeMessage(errorContent(8))
                        this.props.changeScreen(Screens.HOME);
                        return
                    }

                    let players = Object.entries(snapshot.val());
                    const opposingTeam = this.props.team === 0 ? 1 : 0;
                    let possibleNextPlayers = [];
                    let opposingTeamPlayers = {};

                    for (let i = 0; i < players.length; i++) {
                        if (players[i][1].team === opposingTeam) {
                            opposingTeamPlayers[players[i][0]] =
                                {
                                    name: players[i][1].name,
                                    team: players[i][1].team,
                                    points: players[i][1].points
                                };

                            if (players[i][1].hasPlayed === false) {
                                possibleNextPlayers.push({
                                    [players[i][0]]: {
                                        name: players[i][1].name,
                                        team: players[i][1].team,
                                        points: players[i][1].points
                                    }
                                })
                            }
                        }
                    }

                    let nextPlayer = {}
                    if (possibleNextPlayers.length === 0) {
                        let keys = Object.keys(opposingTeamPlayers);

                        for (let i = 0; i < keys.length; i++) {
                            opposingTeamPlayers[keys[i]].hasPlayed = false;
                        }

                        let randVal = Math.floor(Math.random(0, keys.length));

                        nextPlayer = {
                            [keys[randVal]]: {
                                name: opposingTeamPlayers[keys[randVal]].name,
                                team: opposingTeamPlayers[keys[randVal]].team,
                                points: opposingTeamPlayers[keys[randVal]].points
                            }
                        }

                        opposingTeamPlayers[keys[randVal]].hasPlayed = true;
                        console.log('Réinitialisation de la manche...');

                        this.db.getRef(`players/${this.props.gameID}`).update(opposingTeamPlayers);
                    } else {
                        possibleNextPlayers.sort(() => Math.random() < 0.5);
                        nextPlayer = possibleNextPlayers[0];
                        const nextPlayerID = Object.keys(nextPlayer)[0];

                        this.db.getRef(`players/${this.props.gameID}/${nextPlayerID}`).update({hasPlayed: true});
                    }

                    console.log('Choix du prochain joueur...');

                    this.db.getRef(`games/${this.props.gameID}/currentPlayer`).set(nextPlayer);
                })
            }
        }
    }

    getRoundText(round, timerStarted) {
        if (!timerStarted)
            return "A ton tour !"
        switch (round) {
            case 1:
                return "Décrivez le mot sans l'utiliser !"
            case 2:
                return "Mimer le mot sans parler !"
            case 3:
                return "Utilisez un mot pour décrire le mot sans l'utiliser !"
            default:
                return "A ton tour !"
        }


    }

    render() {
        const segment = this.state.isPlaying
            ? <Text style={styles.footerText}>
                {this.getRoundText(this.state.round, this.state.isTimerGoing)}
            </Text>
            : (this.state.isTeamPlaying ? <Text style={styles.footerText}>C'est au tour de votre équipe ! Essayez de deviner le mot !</Text> : <Text style={styles.footerText}>En attente que le tour de l'autre équipe finisse...</Text>)

        const team1Style = this.props.team === 0 ? null : styles.opposing
        const team2Style = this.props.team === 1 ? null : styles.opposing

        return (
            <View style={styles.container}>
                <PrimaryModal
                    title={modalTitles[this.state.round]}
                    modalVisible={this.state.isModalVisible}
                    buttonText={'Ok !'}
                    onCloseModal={() => this.setState({isModalVisible: false})}
                    minHeight={Dimensions.get('screen').height / 5}
                    content={
                        <>
                            <Text style={styles.modalSubheading}>
                                {modalSubtitles[this.state.round]}
                            </Text>
                            <Text style={styles.modalContent}>
                                {this.state.isPlaying
                                    ? modalContentPlaying[this.state.round]
                                    : modalContentWatching[this.state.round]}
                            </Text>
                        </>
                    }
                />
                <InstructionsModal
                    onCloseModal={() => this.setState({showInstructions: false})}
                    modalVisible={this.state.showInstructions}
                />
                <View style={styles.header}>
                    <Text style={styles.title}>Manche {this.state.round}</Text>
                    <View style={styles.score}>
                        <View style={styles.teamScore}>
                            <Text style={[styles.points, team1Style]}>{this.state.score.team1}</Text>
                            <Text style={[styles.team, team1Style]}>Equipe 1</Text>
                        </View>
                        <Timer
                            time={this.state.timeRemaining / 1000}
                            totalTime={60}
                        />
                        <View style={styles.teamScore}>
                            <Text style={[styles.points, team2Style]}>{this.state.score.team2}</Text>
                            <Text style={[styles.team, team2Style]}>Equipe 2</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.body}>
                    {this.state.isPlaying
                        ? <UserPlaying
                            currentWord={this.state.currentWord.word}
                            timerStarted={this.state.isTimerGoing}
                            nextWord={() => this.nextWord()}
                            pass={() => this.pass()}
                            setTimer={(setValue, time) => this.setTimer(setValue, time)}
                            round={this.state.round}
                        />
                        : <OpponentPlaying
                            currentPlayer={this.state.currentPlayer.name}
                            currentTeam={this.state.currentPlayer.team}
                            players={this.state.players}
                            onClickInstructions={() => this.setState({showInstructions: true})}
                        />}
                </View>
                <View style={styles.footer}>
                    {segment}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubheading: {
        fontSize: Dimensions.get('screen').height / 40,
        fontFamily: 'poppins-semibold',
        color: '#ffffff',
        textAlign: 'left'
    },
    modalContent: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#ffffffaa',
        textAlign: 'center',
    },
    header: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#4b42f5',
        minWidth: '100%'
    },
    title: {
        fontSize: Dimensions.get('screen').height / 20,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        marginTop: 15,
    },
    score: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        minWidth: '100%'
    },
    teamScore: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column'
    },
    team: {
        fontSize: Dimensions.get('screen').height / 50,
        fontFamily: 'poppins-semibold',
        color: '#fff',
    },
    points: {
        fontSize: Dimensions.get('screen').height / 20,
        fontFamily: 'poppins-semibold',
        color: '#fff',
    },
    opposing: {
        color: '#ffffff66'
    },
    body: {
        flex: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161616',
        minWidth: '100%'
    },
    footer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#4b42f5',
        minWidth: '100%',
        paddingLeft: 15,
        paddingRight: 15
    },
    footerText: {
        fontSize: Dimensions.get('screen').height / 40,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        textAlign: 'center'
    },
});

export default Game;
