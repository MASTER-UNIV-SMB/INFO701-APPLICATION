import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import SegmentSelector from '../primitives/SegmentSelector';
import GameTab from '../segments/GameTab';
import PlayersTab from '../segments/PlayersTab';
import MoreTab from '../segments/MoreTab';
import Events from '../../constants/Events';
import Fire from '../../Fire';
import PropTypes from 'prop-types';

class OpponentPlaying extends Component {
  state = {
    currentSegment: 'Jeu'
  }

  getTeamStringFromIndex(index) {
    switch (index) {
      case 0: 
        return "Equipe 1"
      case 1:
        return "Equipe 2"
      default:
        return undefined
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <SegmentSelector 
          segments={['Jeu', 'Joueurs', 'Plus...']}
          currentSegment={this.state.currentSegment}
          onChangeSegment={segment => {
            Fire.db.logEvent(Events.SWITCH_TAB, {
              tab: segment,
              screen: 'game',
              purpose: 'Le joueur a changé de tab'
            })
            this.setState({currentSegment: segment})
          }}
        />
        <View style={styles.segmentView}>
          {this.state.currentSegment === 'Jeu'
          ? <GameTab 
              currentPlayer={this.props.currentPlayer}
              currentTeam={this.getTeamStringFromIndex(this.props.currentTeam)}
            /> 
          : null}
          {this.state.currentSegment === 'Joueurs'
          ? <PlayersTab 
              players={this.props.players}
            /> 
          : null}
          {this.state.currentSegment === 'Plus...'
          ? <MoreTab 
              onClickInstructions={() => this.props.onClickInstructions()}
            /> 
          : null}
        </View>
      </View>
    );
  }
}

OpponentPlaying.propTypes = {
  players: PropTypes.array.isRequired,
  currentPlayer: PropTypes.string,
  currentTeam: PropTypes.number,
  onClickInstructions: PropTypes.func.isRequired
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#272727',
    minWidth: '100%',
    maxWidth: '100%',
  },
  segmentView: {
    flex: 1
  }
});

export default OpponentPlaying;
