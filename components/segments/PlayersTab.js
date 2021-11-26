import React, {Component} from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import PropTypes from 'prop-types';

class PlayersTab extends Component {

  getTeam(teamIndex) {
    let team = []
    this.props.players.forEach(player => {
      if (player.team === teamIndex) team.push(player)
    })
    return this.sortTeamByScore(team)
  }

  sortTeamByScore(team) {
    return team.sort((a,b) => {
      return b.points - a.points
    })
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.teamView}>
          <Text style={styles.team}>Equipe 1</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.playerHeader}>Joueurs</Text>
            <Text style={styles.pointsHeader}>Points</Text>
          </View>
          {this.getTeam(0).map((player) => {
            return (
              <View style={styles.player} key={player.id}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerScore}>{player.points}</Text>
              </View>
            )
          })}
        </View>
        <View style={styles.teamView}>
          <Text style={styles.team}>Equipe 2</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.playerHeader}>Joueurs</Text>
            <Text style={styles.pointsHeader}>Points</Text>
          </View>
          {this.getTeam(1).map((player) => {
            return (
              <View style={styles.player} key={player.id}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerScore}>{player.points}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    );
  }
}

PlayersTab.propTypes = {
  players: PropTypes.array.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    minWidth: '100%',
    maxWidth: '100%',
    padding: 15,
  },
  teamView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerHeader: {
    flex: 1,
    fontSize: Dimensions.get('screen').height/55,
    textTransform: "uppercase",
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'left',
  },
  pointsHeader: {
    flex: 1,
    fontSize: Dimensions.get('screen').height/55,
    textTransform: "uppercase",
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'right',
  },
  team: {
    fontSize: Dimensions.get('screen').height/50,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'left',
  },
  player: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '100%',
    maxWidth: '100%'
  },
  playerName: {
    flex: 5,
    fontSize: Dimensions.get('screen').height/55,
    fontFamily: 'poppins-semibold',
    color: '#e7e7e7',
    marginTop: 5,
    textAlign: 'left'
  },
  playerScore: {
    flex: 1,
    fontSize: Dimensions.get('screen').height/55,
    fontFamily: 'poppins-semibold',
    color: '#4b42f5',
    marginTop: 5,
    textAlign: 'right'
  }
});

export default PlayersTab;
