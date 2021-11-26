import React from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';

SegmentSelector.propTypes = {
  segments: PropTypes.array.isRequired,
  currentSegment: PropTypes.string.isRequired,
  onChangeSegment: PropTypes.func.isRequired,
}

export default function SegmentSelector(props) {
  return (
      <View style={styles.container}>
        {props.segments.map((segment, i) => {
          const segStyle = segment === props.currentSegment
              ? styles.active
              : styles.disabled
          return (
              <TouchableOpacity
                  key={i}
                  style={styles.button}
                  onPress={() => props.onChangeSegment(segment)}
              >
                <Text style={segStyle}>{segment}</Text>
              </TouchableOpacity>
          )
        })}
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: 50
  },
  button: {
    marginLeft: 12,
    marginRight: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    color: '#ffffff55',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height / 40,
  },
  active: {
    color: '#ffffff',
    fontFamily: 'poppins-semibold',
    fontSize: Dimensions.get('screen').height / 40,
  }
});
