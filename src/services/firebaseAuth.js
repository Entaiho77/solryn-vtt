import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../firebase.js'

export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password).then((cred) => cred.user)
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password).then((cred) => cred.user)
}

export function logOut() {
  return firebaseSignOut(auth)
}
