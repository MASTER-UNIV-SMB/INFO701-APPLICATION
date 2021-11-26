import React, {Component} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import PrimaryButton from '../primitives/PrimaryButton';
import PropTypes from 'prop-types';

class MoreTab extends Component {

  render() {
    return (
        <View style={styles.container}>
          <PrimaryButton
              text='Comment jouer ?'
              onPress={() => this.props.onClickInstructions()}
              buttonStyle={styles.instructionsButton}
              textStyle={styles.instructionsButtonText}
          />
        </View>
    );
  }
}

MoreTab.propTypes = {
  onClickInstructions: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
    minWidth: '100%',
    maxWidth: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    alignItems: 'center',
  },
  instructionsButton: {
    backgroundColor: '#262626',
    minWidth: '85%',
    maxWidth: '85%',
    marginTop: 30,
    height: Dimensions.get('screen').height / 15,
  },
  instructionsButtonText: {
    color: '#fff',
  }
});

export default MoreTab;
