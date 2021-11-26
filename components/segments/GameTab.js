import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';

class GameTab extends Component {

  render() {
    return (
        <View style={styles.container}>
          <Text style={styles.text}>
            <Text style={styles.colored}>{` ${this.props.currentPlayer} `}</Text>
            {` de `}
            <Text style={styles.colored}>{` ${this.props.currentTeam} `}</Text>
            {` est entrain de jouer !`}
          </Text>
        </View>
    );
  }
}

GameTab.propTypes = {
  currentPlayer: PropTypes.string,
  currentTeam: PropTypes.string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161616',
    minWidth: '100%',
    maxWidth: '100%',
    padding: 15,
  },
  text: {
    fontSize: Dimensions.get('screen').height / 30,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center'
  },
  colored: {
    color: '#4b42f5'
  }
});

export default GameTab;
