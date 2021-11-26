import React from 'react';
import {Dimensions, StyleSheet, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';

PrimaryTextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  autoCorrect: PropTypes.bool.isRequired,
  autoCapitalize: PropTypes.string,
  placeholder: PropTypes.string,
  marginBottom: PropTypes.number,
  marginTop: PropTypes.number,
  style: PropTypes.object,
  placeholderTextColor: PropTypes.string,
  keyboardType: PropTypes.string,
  onFocus: PropTypes.func,
  returnKeyType: PropTypes.string,
  onSubmitEditing: PropTypes.func,
  focus: PropTypes.bool,
  multiline: PropTypes.bool,
}

export default function PrimaryTextInput(props) {
  let viewStyling = {}
  if (props.marginBottom) viewStyling.marginBottom = props.marginBottom
  if (props.marginTop) viewStyling.marginTop = props.marginTop

  return (
      props.multiline ?
          <View style={styles.multilineView}>
            <TextInput
                style={[styles.input, viewStyling, props.style]}
                autoCompleteType={"off"}
                autoCorrect={props.autoCorrect}
                autoCapitalize={props.autoCapitalize}
                blurOnSubmit={true}
                focus={props.focus ? props.focus : undefined}
                multiline
                onChangeText={text => props.onChangeText(text)}
                onFocus={props.onFocus ? () => props.onFocus() : () => {
                }}
                onSubmitEditing={props.onSubmitEditing ? () => props.onSubmitEditing() : () => {
                }}
                placeholder={props.placeholder}
                placeholderTextColor={props.placeholderTextColor || '#1c18a8'}
                keyboardType={props.keyboardType}
                returnKeyType={props.returnKeyType ? props.returnKeyType : 'default'}
                value={props.value}
            />
          </View> :
          <TextInput
              style={[styles.input, viewStyling, props.style]}
              autoCompleteType={"off"}
              autoCorrect={props.autoCorrect}
              autoCapitalize={props.autoCapitalize}
              focus={props.focus ? props.focus : undefined}
              onChangeText={text => props.onChangeText(text)}
              onFocus={props.onFocus ? () => props.onFocus() : () => {
              }}
              onSubmitEditing={props.onSubmitEditing ? () => props.onSubmitEditing() : () => {
              }}
              placeholder={props.placeholder}
              placeholderTextColor={props.placeholderTextColor || '#616161'}
              keyboardType={props.keyboardType}
              returnKeyType={props.returnKeyType ? props.returnKeyType : 'default'}
              value={props.value}
          />
  )
};

const styles = StyleSheet.create({
  input: {
    paddingLeft: Dimensions.get('screen').width / 15,
    paddingRight: Dimensions.get('screen').width / 15,
    minWidth: '85%',
    maxWidth: '85%',
    color: "#ffffff",
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    height: Dimensions.get('screen').height / 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: Dimensions.get('screen').height / 50,
    fontFamily: 'poppins-semibold'
  },
  multilineView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
});
