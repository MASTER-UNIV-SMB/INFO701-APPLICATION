import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import PrimaryButton from '../primitives/PrimaryButton';
import Events from '../../constants/Events';
import Fire from '../../Fire';
import PropTypes from 'prop-types';

const ROUND_STRINGS = {
  one: "Dans cette manche, vous devrez expliquer le mot à votre équipe sans utiliser le mot lui-même ni faire de gestes.",
  two: "Dans cette manche, vous pouvez seulement mimer le mot à votre équipe. Vous n'êtes pas autorisé à dire quoi que ce soit.",
  three: "Dans cette manche, vous ne pouvez dire qu'un seul mot à votre équipe. Vous ne pouvez pas utiliser le mot lui-même ni aucun geste."
}

class UserPlaying extends Component {
  getRoundText(round) {
    switch (round) {
      case 1:
        return ROUND_STRINGS.one
      case 2:
        return ROUND_STRINGS.two
      case 3:
        return ROUND_STRINGS.three
      default:
        return ""
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.instructions}>
            {this.getRoundText(this.props.round)}
          </Text>
        </View>
        <View style={styles.wordCard}>
            {this.props.timerStarted
            ? <Text style={styles.word}>
                {this.props.currentWord}
              </Text>
            : <Text style={styles.callToAction}>
                  C'est à toi de jouer !
              </Text>
            }
        </View>
        <View style={styles.footer}>
          {this.props.timerStarted
          ? <View style={styles.actionButtons}>
              <PrimaryButton
                text="Passer"
                onPress={()=>this.props.pass()}
                buttonStyle={styles.passButton}
                textStyle={styles.passButtonText}
              />
              <PrimaryButton
                text="Suivant"
                onPress={()=>this.props.nextWord()}
                buttonStyle={styles.correctButton}
                textStyle={styles.correctButtonText}
              />
            </View>
          : <PrimaryButton
              text="Démarrer"
              onPress={()=>{
                this.props.setTimer(true, Date.now())
                Fire.db.logEvent(Events.START_ROUND, {
                  screen: 'game',
                  purpose: "Le joueur à démarré la manche",
                })
              }}
              buttonStyle={styles.startButton}
              textStyle={styles.startButtonText}
            />
          }
        </View>
      </View>
    );
  }
}

UserPlaying.propTypes = {
  currentWord: PropTypes.string.isRequired,
  timerStarted: PropTypes.bool.isRequired,
  nextWord: PropTypes.func.isRequired,
  pass: PropTypes.func.isRequired,
  setTimer: PropTypes.func.isRequired,
  round: PropTypes.number.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flex: 1.5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  startButton: {
    minWidth: '50%',
    maxWidth: '50%',
    backgroundColor: '#272727'
  },
  startButtonText: {
    color: '#fff'
  },
  instructions: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-italic',
    color: '#888888',
    textAlign: 'center',
  },
  footer: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordCard: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '85%',
    maxWidth: '85%',
  },
  word: {
    fontSize: Dimensions.get('screen').height/20,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  callToAction: {
    fontSize: Dimensions.get('screen').height/30,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  actionButtons: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    minWidth: '40%',
    maxWidth: '40%',
    borderWidth: 2,
    borderColor: '#272727',
  },
  passButtonText: {
    color: '#c45d5d'
  },
  correctButton: {
    minWidth: '40%',
    maxWidth: '40%',
    backgroundColor: '#272727'
  },
  correctButtonText: {
    color: '#fff'
  },
});

export default UserPlaying;
