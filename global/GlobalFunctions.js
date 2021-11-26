import Fire from '../Fire';
import Events from '../constants/Events';
import Errors from '../constants/Errors';
import firebase from 'firebase';

export const isValidSnapshot = (snapshot, errorCode) => {
  if (!snapshot || snapshot.val() === null || snapshot.val() === undefined) {
    Fire.db.logEvent(Events.SNAPSHOT_ERROR, {
      errorCode: errorCode,
      description: Errors[errorCode]
    })
    return false
  }
  return true
}

export const getCurrentTimestamp = () => {
  return firebase.firestore.Timestamp.now();
}

export const validateGame = (game) => {
  return (!!game.timestamp && typeof game.timestamp === "number")
}
