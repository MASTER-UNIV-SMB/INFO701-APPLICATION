import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Screens from '../constants/Screens';
import Events from '../constants/Events';
import Fire from '../Fire';
import PrimaryButton from '../components/primitives/PrimaryButton';
import LoadingPage from '../components/primitives/LoadingPage';
import {isValidSnapshot} from '../global/GlobalFunctions';
import {errorContent, giveFeedbackContent} from '../constants/Content';
import {messageValue} from '../constants/FirestoreValues';

class Finish extends Component {

    state = {
        team1Score: null,
        team2Score: null,
        isAdLoaded: true,
        bypassAd: false,
    }

    async componentDidMount() {
        this.db = Fire.db;

        this.db.getRef(`games/${this.props.gameID}/score`).once('value', (snapshot) => {
            if (!isValidSnapshot(snapshot, 9)) {
                this.props.setHomeMessage(errorContent(9))
                this.props.changeScreen(Screens.HOME);
                return
            }

            let scores = Object.entries(snapshot.val());

            let team1Pts = 0;
            let team2Pts = 0;

            for (let i = 0; i < scores.length; i++) {
                if (scores[i][0] === 'team1') {
                    team1Pts = scores[i][1]
                } else if (scores[i][0] === 'team2') {
                    team2Pts = scores[i][1]
                }
            }

            this.setState({team1Score: team1Pts, team2Score: team2Pts});
        });
    }

    componentWillUnmount() {
        this.setState({
            team1Score: null,
            team2Score: null,
            isAdLoaded: false,
            bypassAd: false
        })
    }

    deleteGame() {
        this.db.getRef(`games/${this.props.gameID}`).remove()
            .then(() => {
                console.log(`La partie (${this.props.gameID}) a été supprimée`);
            })
            .catch((error) => 'Erreur lors de la suppresion de la partie : ' + error.message);
    }

    deleteGameWords() {
        this.db.getRef(`words/${this.props.gameID}`).remove()
            .then(() => {
                console.log(`Les mots pour la partie (${this.props.gameID}) ont été supprimés`);
            })
            .catch((error) => 'Erreur lors de la suppresion : ' + error.message);
    }

    checkIfLastToLeave() {
        this.db.getRef(`players`).orderByKey().equalTo(this.props.gameID).once('value', (snapshot) => {
            if (snapshot.val() == null) {
                console.log(`${this.props.screenName} est le dernier joueur a quitter`);
                this.deleteGame();
                this.deleteGameWords();
            }
        });
    }

    async didSignUp(promotionId) {
        try {
            const value = await AsyncStorage.getItem(promotionId)
            return value === "true"
        } catch {
            return false
        }
    }

    async goHome() {
        this.db.logEvent(Events.GO_HOME, {
            screen: 'finish',
            purpose: 'La partie est terminée et l\'utilisateur a cliqué pour revenir à l\'accueil',
        })

        this.db.getRef(`players/${this.props.gameID}/${this.props.playerID}`).remove()
            .then(() => {
                console.log(`${this.props.playerID} (${this.props.screenName}) a quitté la partie`);
                this.checkIfLastToLeave();
            })
            .catch((error) => 'Impossible de quitter la partie: ' + error.message)

        const ref = this.db.getCollection(messageValue).doc('gameFinish')

        this.props.changeScreen(Screens.HOME);
    }

    render() {
        const {team1Score, team2Score} = this.state;

        let loading = false;
        if (team1Score === null || team2Score === null) {
            loading = true;
        }

        let message = "Egalité !";
        if ((this.props.team === 0 && team1Score > team2Score) ||
            (this.props.team === 1 && team2Score > team1Score)) {
            message = "Votre équipe a gagné"
        } else if ((this.props.team === 0 && team1Score < team2Score) ||
            (this.props.team === 1 && team2Score < team1Score)) {
            message = "Votre équipe a perdu"
        }

        const team1Style = this.props.team === 0 ? null : styles.opposing
        const team2Style = this.props.team === 1 ? null : styles.opposing

        return (
            <LoadingPage
                loadingText={"Fin de la partie !"}
                isLoading={loading}>
                <View style={styles.container}>
                    <View style={styles.body}>
                        <Text style={styles.message}>{message}</Text>
                        <View style={styles.score}>
                            <View style={styles.teamScore}>
                                <Text style={[styles.points, team1Style]}>{team1Score}</Text>
                                <Text style={[styles.team, team1Style]}>Equipe 1</Text>
                            </View>
                            <View style={styles.teamScore}>
                                <Text style={[styles.points, team2Style]}>{team2Score}</Text>
                                <Text style={[styles.team, team2Style]}>Equipe 2</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <PrimaryButton
                            text="Retour à l'accueil"
                            onPress={() => this.goHome()}
                        />
                    </View>
                </View>
            </LoadingPage>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        fontSize: Dimensions.get('screen').height / 25,
        fontFamily: 'poppins-semibold',
        color: '#fff',
        textAlign: 'center'
    },
    score: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        minWidth: '100%',
        paddingTop: 20,
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
    footer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: '100%',
    }
});

export default Finish;
