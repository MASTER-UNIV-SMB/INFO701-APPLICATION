import React, {Component} from 'react';
import {Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import Fire from '../../Fire';
import PropTypes from 'prop-types';

class PrimaryModal extends Component {
  state = {
    fontSize: this.props.titleHeight ? this.props.titleHeight : Dimensions.get('screen').height / 30
  }

  componentDidMount() {
    this.db = Fire.db;
    this.setState({
      email: "",
      error: "",
      checkValue: false
    })
  }

  pressSubmit() {
    this.props.onCloseModal()
  }

  render() {
    const modalStyling = {}
    if (this.props.minHeight !== undefined)
      modalStyling.minHeight = this.props.minHeight

    const modalBodyStyling = {}
    if (!this.props.cornerClose) {
      modalBodyStyling.paddingTop = Dimensions.get('screen').width * 0.04
    }

    return (
        <Modal
            animationType='fade'
            presentationStyle='overFullScreen'
            visible={this.props.modalVisible}
            transparent={true}
        >
          <View style={styles.background}>
            <View style={[styles.modalBox, modalStyling]}>
              {this.props.cornerClose ?
                  <View style={styles.xBoxView}>
                    <TouchableOpacity onPress={() => this.props.onCancel()}>
                      <AntDesign
                          name={`closecircle`}
                          size={Dimensions.get('screen').height / 30}
                          color={'#ffffff'}
                      />
                    </TouchableOpacity>
                  </View>
                  : null}
              <View style={[styles.modalBoxBody, modalBodyStyling]}>
                <View style={styles.titleView}>
                  <Text
                      style={[styles.title, {fontSize: this.state.fontSize}]}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      onTextLayout={e => {
                        const {lines} = e.nativeEvent;
                        if (lines.length > 1) {
                          this.setState({fontSize: this.state.fontSize - 1});
                        }
                      }}
                  >
                    {this.props.title}
                  </Text>
                </View>
                <View style={styles.content}>
                  {this.props.content}
                </View>
                <View style={styles.buttonView}>
                  {this.props.twoButtons
                      ? <View style={styles.button}>
                        <PrimaryButton
                            buttonStyle={styles.buttonStyleSecondary}
                            textStyle={styles.buttonTextSecondary}
                            text={this.props.secondaryButtonText
                                ? this.props.secondaryButtonText : "Annuler"}
                            onPress={() => this.props.onCancel()}
                        />
                      </View>
                      : null}
                  <View style={styles.button}>
                    <PrimaryButton
                        buttonStyle={this.props.twoButtons
                            ? styles.buttonStyleSecondary
                            : {}}
                        textStyle={this.props.twoButtons
                            ? styles.buttonTextSecondary
                            : {}}
                        text={this.props.buttonText}
                        onPress={() => this.pressSubmit()}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
    );
  }
}

PrimaryModal.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  content: PropTypes.element.isRequired,
  modalVisible: PropTypes.bool.isRequired,
  buttonText: PropTypes.string.isRequired,
  secondaryButtonText: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
  titleHeight: PropTypes.number,
  twoButtons: PropTypes.bool,
  onCancel: PropTypes.func,
  askEmail: PropTypes.bool,
  emailId: PropTypes.string,
  cornerClose: PropTypes.bool
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100%',
    maxWidth: '100%',
    backgroundColor: '#000000aa',
  },
  modalBox: {
    backgroundColor: '#272727',
    minHeight: Dimensions.get('screen').height * 0.8,
    maxHeight: Dimensions.get('screen').height * 0.8,
    minWidth: '90%',
    maxWidth: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: Dimensions.get('screen').width * 0.04,
  },
  modalBoxBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: Dimensions.get('screen').width * 0.06,
    paddingBottom: Dimensions.get('screen').width * 0.04,
    paddingTop: 0,
    minHeight: Dimensions.get('screen').height / 10,
  },
  titleView: {
    width: '100%',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'poppins-semibold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonStyle: {
    maxWidth: '90%',
    minWidth: '90%'
  },
  buttonStyleSecondary: {
    maxWidth: '90%',
    minWidth: '90%',
    backgroundColor: '#272727',
    marginTop: 0,
    marginBottom: 0
  },
  buttonTextSecondary: {
    color: '#fff'
  },
  button: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  xBoxView: {
    display: "flex",
    alignItems: "flex-end",
    minWidth: "100%",
    maxWidth: "100%",
    paddingTop: 8,
    paddingRight: 8,
  },
  emailInput: {
    height: Dimensions.get('screen').height / 18,
    fontSize: Dimensions.get('screen').height / 45,
    minWidth: '100%',
    paddingLeft: Dimensions.get('screen').width / 20,
    paddingRight: Dimensions.get('screen').width / 20,
    textAlign: 'center'
  },
  error: {
    minHeight: Dimensions.get('screen').width / 25,
    fontSize: Dimensions.get('screen').height / 60,
    fontFamily: 'poppins-regular',
    color: '#ff0000',
    textAlign: 'center'
  },
  checkboxContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Dimensions.get('screen').width / 30
  },
  checkboxText: {
    flex: 1,
    fontSize: Dimensions.get('screen').height / 60,
    fontFamily: 'poppins-semibold',
    color: '#ffffffaa',
    marginLeft: 20,
  },
});

export default PrimaryModal;
