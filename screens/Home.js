import React, {useEffect, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Screens from '../constants/Screens';
import PrimaryButton from '../components/primitives/PrimaryButton';
import InstructionsModal from '../components/segments/InstructionsModal';
import {DEV} from '../constants/Mode'
import * as app from '../app.json';
import {requestTrackingPermissionsAsync} from "expo-tracking-transparency";

const isTitleImage = true

export default function Home(props) {
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('Permission Granted');
      } else {
        console.log('Permission Denied');
      }
    })();
  }, []);

  props.setPlayerID('');
  props.updateName('');
  props.updateGameID('');
  props.updateTeam(-1);

  return (
      <View style={styles.container}>
        <InstructionsModal
            onCloseModal={() => setShowInstructions(false)}
            modalVisible={showInstructions}
        />
        <View style={styles.header}>
          <Text style={styles.versionText}>
            {DEV ? '[DEV] ' : ''}v{app.expo.version}
          </Text>
        </View>
        <View style={styles.titleView}>
          {isTitleImage
              ? <Image style={styles.image} source={require('../assets/logo.png')}/>
              : <Text style={styles.title}>TimeToGuess</Text>
          }
        </View>
        <View style={styles.buttonView}>
          <PrimaryButton
              text={"Créer une partie"}
              onPress={() => props.changeScreen(Screens.CREATE)}
          />
          <PrimaryButton
              text={"Rejoindre une partie"}
              onPress={() => props.changeScreen(Screens.JOIN)}
          />
          <TouchableOpacity
              style={styles.instructionsTag}
              onPress={() => setShowInstructions(true)}
          >
            <Text style={styles.instructionsText}>Comment jouer ?</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleView: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width
  },
  title: {
    fontSize: 80,
    fontFamily: 'poppins-extrabold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowOffset: {width: 5, height: 7},
    textShadowRadius: 1,
    textShadowColor: '#000000cc',
  },
  image: {
    resizeMode: 'contain',
    width: '90%',
    maxHeight: Dimensions.get('screen').height * 0.5,
  },
  buttonView: {
    flex: 2,
    minWidth: '85%',
    display: 'flex',
    alignItems: 'center'
  },
  instructionsTag: {
    marginTop: 25,
    paddingLeft: Dimensions.get('screen').width / 15,
    paddingRight: Dimensions.get('screen').width / 15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  instructionsText: {
    fontSize: Dimensions.get('screen').height / 50,
    fontFamily: 'poppins-semibold',
    color: '#ffffff66',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Dimensions.get('screen').height / 40,
    marginTop: 3,
  },
  feedbackButton: {
    flex: 1,
  },
  feedbackText: {
    fontSize: Dimensions.get('screen').height / 60,
    fontFamily: 'poppins-semibold',
    color: '#ffffff66',
    paddingLeft: 20,
    textAlign: 'left',
  },
  versionText: {
    flex: 1,
    fontSize: Dimensions.get('screen').height / 60,
    fontFamily: 'poppins-italic',
    color: '#ffffff33',
    textAlign: 'right',
    paddingRight: 20,
    paddingLeft: 20
  },
  modalText: {
    fontSize: Dimensions.get('screen').height / 45,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'center',
    marginTop: 10,
  },
});
