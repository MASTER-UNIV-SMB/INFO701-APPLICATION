import React from 'react';
import {Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {AntDesign} from '@expo/vector-icons';

BackButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  margin: PropTypes.number,
  width: PropTypes.string
}

export default function BackButton(props) {
  let viewStyling = {}
  if (props.margin) viewStyling.margin = props.margin
  if (props.width) {
    viewStyling.minWidth = props.width
    viewStyling.maxWidth = props.width
  }

  return (
      <TouchableOpacity
          style={[styles.button, viewStyling]}
          onPress={() => props.onPress()}
      >
        <AntDesign
            name={`arrowleft`}
            size={Dimensions.get('screen').height / 25}
            color={'#ffffff'}
        />
      </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  button: {
    minWidth: '20%',
    maxWidth: '20%',
    borderRadius: Dimensions.get('screen').height,
    height: Dimensions.get('screen').width / 7,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 2
  }
});
