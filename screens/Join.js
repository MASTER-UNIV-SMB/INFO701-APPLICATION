import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LoadingPage from '../components/primitives/LoadingPage';
import PrimaryTextInput from '../components/primitives/PrimaryTextInput';
import PrimaryButton from '../components/primitives/PrimaryButton';
import BackButton from '../components/primitives/BackButton';
import PrimaryModal from '../components/primitives/PrimaryModal';
import Screens from '../constants/Screens';
import {gameIDLength} from '../constants/Structures';
import {modalStart} from '../constants/ModalContent';
import Events from '../constants/Events';
import Fire from '../Fire';

class Join extends Component {

  state = {
    name: '',
    joinCode: '',
    error: '',
    disableButton: false,
    isModalVisible: false,
    isLoading: false,
    isAdLoaded: true,
    bypassAd: false,
  }

  async componentDidMount() {
    this.db = Fire.db;
  }

  componentWillUnmount() {
    this.setState({
      disableButton: false,
      isLoading: false,
      isAdLoaded: false,
      bypassAd: false
    })
  }

  async canUserJoinGame(gameID) {
    console.log('Verification de la partie...');
    try {
      let snapshot = await this.db.getRef(`games`).orderByKey().equalTo(gameID).once('value');

      if (snapshot.val() == null) {
        this.setState({
          disableButton: false,
          isLoading: false,
          error: `Cette partie n'existe pas !`
        });

        return false;
      } else if (snapshot.val()[gameID].round !== '' || snapshot.val()[gameID].status !== Screens.LOBBY) {
        this.setState({
          disableButton: false,
          isLoading: false,
          error: `Mince, cette partie a déjà commencé !`
        });

        return false;
      }

      this.setState({isLoading: true});

      return true;
    } catch {
      this.setState({disableButton: false, isLoading: false})

      return false;
    }
  }

  async pressSubmit() {
    let gameID = this.state.joinCode.toUpperCase();
    if (this.state.name.trim() < 1) {
      this.setState({error: `Vous devez entrer un pseudo !`});
      return
    }
    if (gameID.length !== gameIDLength) {
      this.setState({error: `Le code de la partie doit faire ${gameIDLength} caractères`});
      return
    }

    this.setState({disableButton: true})

    this.db.logEvent(Events.JOIN_GAME, {
      screen: 'join',
      purpose: 'L\'utilisateur a saisi ses infos et a cliqué sur "Rejoindre"'
    })

    if (await this.canUserJoinGame(gameID)) {
      this.finalizeJoin(this.state.name.trim(), gameID)
      this.props.changeScreen(Screens.LOBBY);
    }
  }

  finalizeJoin(name, gameID) {
    this.props.updateName(name);
    this.props.updateGameID(gameID);
  }

  render() {
    return (
        <LoadingPage
            loadingText={"Connexion à la partie..."}
            isLoading={this.state.isLoading}>
          <View style={styles.container}>
            <PrimaryModal
                title='Rejoindre une partie'
                modalVisible={this.state.isModalVisible}
                buttonText='Ok !'
                onCloseModal={() => this.setState({isModalVisible: false})}
                minHeight={Dimensions.get('screen').height / 5}
                content={
                  <Text style={styles.modalContent}>
                    {modalStart.JOIN}
                  </Text>
                }
            />
            <View style={styles.mainView}>
              <Text style={styles.title}>Rejoindre une partie</Text>
              <View style={styles.errorBox}>
                <Text style={styles.error}>{this.state.error}</Text>
              </View>
              <PrimaryTextInput
                  autoCorrect={false}
                  marginBottom={10}
                  onChangeText={text => this.setState({name: text})}
                  placeholder={'Pseudo'}
                  value={this.state.name}
              />
              <PrimaryTextInput
                  autoCapitalize={"characters"}
                  autoCorrect={false}
                  onChangeText={text => this.setState({joinCode: text})}
                  placeholder={"Code de la partie"}
                  value={this.state.joinCode}
              />
              <PrimaryButton
                  text={'Rejoindre'}
                  onPress={() => this.pressSubmit()}
                  disabled={this.state.disableButton}
              />
              <TouchableOpacity
                  style={styles.questionTag}
                  onPress={() => this.setState({isModalVisible: true})}
              >
                <Text style={styles.questionTagText}>Besoin d'aide ?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.backButtonView}>
              <BackButton
                  onPress={() => {
                    this.db.logEvent(Events.BACK_BUTTON, {
                      screen: 'join',
                      purpose: 'L\'utilisateur sur la page de connexion a cliqué pour revenir au lobby'
                    });

                    this.props.changeScreen(Screens.HOME)
                  }}
                  margin={Dimensions.get('screen').width / 15}
              />
            </View>
          </View>
        </LoadingPage>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Dimensions.get('screen').height / 30,
    fontFamily: 'poppins-semibold',
    color: '#fff',
    marginBottom: 10,
  },
  mainView: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButtonView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  errorBox: {
    minHeight: Dimensions.get('screen').height / 15,
    maxHeight: Dimensions.get('screen').height / 15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  error: {
    fontSize: Dimensions.get('screen').height / 50,
    fontFamily: 'poppins-semibold',
    color: '#c46363',
    textAlign: 'center',
  },
  questionTag: {
    marginTop: 15,
    paddingLeft: Dimensions.get('screen').width / 15,
    paddingRight: Dimensions.get('screen').width / 15,
    minWidth: '85%',
    maxWidth: '85%',
  },
  questionTagText: {
    fontSize: Dimensions.get('screen').height / 50,
    fontFamily: 'poppins-semibold',
    color: '#ffffff66',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalContent: {
    fontSize: Dimensions.get('screen').height / 50,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    textAlign: 'left'
  }
});

export default Join;
