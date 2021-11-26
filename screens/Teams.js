import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import PrimaryButton from '../components/primitives/PrimaryButton';
import Loader from '../components/primitives/Loader';
import Screens from '../constants/Screens';
import Events from '../constants/Events';
import Fire from '../Fire';
import { isValidSnapshot } from '../global/GlobalFunctions';
import { errorContent } from '../constants/Content';

class Teams extends Component {
  state = {
    host: {name: null, id: null},
    team1: [],
    team2: [],
    stopTasks: false,
    disableButton: false,
  }

  componentDidMount() {
    this.db = Fire.db;

    this.db.getRef(`games/${this.props.gameID}/status`).on('value', (snapshot) => {
      if (snapshot.val() === Screens.GAME) {
        this.props.changeScreen(Screens.GAME);
      }
    });

    this.db.getRef(`players/${this.props.gameID}`).on('value', (snapshot) => {
      if (!isValidSnapshot(snapshot, 2)) {
        this.props.setHomeMessage(errorContent(2))
        this.props.changeScreen(Screens.HOME);
        return
      }

      let players = Object.entries(snapshot.val());

      let team1Players = [];
      let team2Players = [];

      for (let i = 0; i < players.length; i++) {
        if (players[i][1].team === 0) {
          team1Players.push(players[i]);
        } else if (players[i][1].team === 1) {
          team2Players.push(players[i]);
        }

        if (players[i][0] === this.props.playerID) {
          this.props.updateTeam(players[i][1].team);
        }
      }

      if (this.state.stopTasks === false) {
        this.setState({team1: team1Players, team2: team2Players});
      }
    });

    this.db.getRef(`games/${this.props.gameID}/host`).on('value', (snapshot) => {
      if (!isValidSnapshot(snapshot, 3)) {
        this.props.setHomeMessage(errorContent(3))
        this.props.changeScreen(Screens.HOME);
        return
      }
      let host = Object.entries(snapshot.val())[0];

      if (this.state.stopTasks === false) {
        this.setState({host: {name: host[1], id: host[0]}});
      }
    });
  }

  componentWillUnmount() {
    this.setState({stopTasks: true, disableButton: false})
    this.db.getRef(`players/${this.props.gameID}`).off();
    this.db.getRef(`games/${this.props.gameID}/status`).off();
    this.db.getRef(`games/${this.props.gameID}/host`).off();
  }

  getTeam(teamName) {
    return this.state[teamName].map((player, i) => {
      let suffix = player[0] === this.props.playerID ? ' (Toi)' : null
      return(<Text key={i} style={styles.player}>{player[1].name}{suffix}</Text>);
    });
  }

  startGame() {
    this.setState({ disableButton: true })

    this.db.logEvent(Events.START_GAME, {
      screen: 'teams',
      purpose: 'La partie démarre',
    })

    const { team1 } = this.state
    const playerIndex = Math.floor(Math.random(0, team1.length));

    const currentPlayerObj = {
      [team1[playerIndex][0]]: {
        name: team1[playerIndex][1].name,
        team: team1[playerIndex][1].team,
      }
    };

    this.db.getRef(`games/${this.props.gameID}`).update({
      status: Screens.GAME,
      currentPlayer: currentPlayerObj,
      round: 1
    }).then(() => {
      this.db.getRef(`players/${this.props.gameID}/${team1[playerIndex][0]}/hasPlayed`).set(true);
    }).catch(() =>  this.setState({ disableButton: false }))
  }

  render() {
    const teamOne = this.getTeam('team1');
    const teamTwo = this.getTeam('team2');

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Equipes</Text>
        </View>
        <View style={styles.body}>
          <Loader
              isLoading={this.state.team1.length === 0}
          >
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.team}>
                <Text style={styles.teamName}>Equipe 1</Text>
                {teamOne}
              </View>
              <View style={styles.team}>
                <Text style={styles.teamName}>Equipe 2</Text>
                {teamTwo}
              </View>
            </ScrollView>
          </Loader>
        </View>
        <View style={styles.footer}>
          {this.props.playerID === this.state.host.id
          ? <PrimaryButton
            text='Démarrer'
            onPress={()=>this.startGame()}
            buttonStyle={styles.startButton}
            textStyle={styles.startButtonText}
            disabled={this.state.disableButton}
          />
          : <Text style={styles.footerText}>En attente de l'hôte pour démarrer la partie...</Text>
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
  },
  header: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#4b42f5',
    minWidth: '100%'
  },
  title: {
    fontSize: Dimensions.get('screen').height/25,
    fontFamily: 'poppins-semibold',
    textTransform: "uppercase",
    color: '#fff',
    marginTop: 30,
  },
  scroll: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100%'
  },
  body: {
    flex: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#161616',
    minWidth: '100%'
  },
  team: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  teamName: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    textTransform: "uppercase",
    color: '#4b42f5',
    marginTop: 15,
  },
  player: {
    fontSize: Dimensions.get('screen').height/45,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginTop: 5,
  },
  footer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4b42f5',
    minWidth: '100%'
  },
  footerText: {
    fontSize: Dimensions.get('screen').height/40,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  startButton: {
    backgroundColor: '#4b42f5',
    borderWidth: 2,
    borderColor: '#ffffff',
    height: Dimensions.get('screen').height/15,
  },
  startButtonText: {
    color: '#ffffff',
  },
});

export default Teams;
