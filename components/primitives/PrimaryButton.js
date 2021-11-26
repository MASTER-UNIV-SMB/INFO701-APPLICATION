import React from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

PrimaryButton.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  color: PropTypes.string,
  hasOutline: PropTypes.bool,
  outlineColor: PropTypes.string,
  textColor: PropTypes.string,
  width: PropTypes.string,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
}

export default function PrimaryButton(props) {
  let viewStyling = {}
  let textStyling = {}
  if (props.color) viewStyling.backgroundColor = props.color
  if (props.textColor) textStyling.color = props.textColor
  if (props.hasOutline) {
    viewStyling.borderWidth = 1
    viewStyling.borderColor = `#ffffff`
  }
  if (props.borderColor) viewStyling.borderColor = props.outlineColor
  if (props.width) {
    viewStyling.minWidth = props.width
    viewStyling.maxWidth = props.width
  }

  const isDisabled = !(props.disabled === undefined || props.disabled === false)

  return (
      <TouchableOpacity
          style={[styles.button, viewStyling, props.buttonStyle]}
          onPress={isDisabled ? () => {
          } : () => props.onPress()}
      >
        <Text style={[styles.text, textStyling, props.textStyle]}>{props.text}</Text>
      </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  button: {
    minWidth: '85%',
    maxWidth: '85%',
    backgroundColor: '#272727',
    borderRadius: 10,
    margin: 10,
    height: Dimensions.get('screen').height / 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height / 45,
  }
});
