import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
 

const firebaseConfig = {
  apiKey: "AIzaSyAkmL0e7fK-WdnnagLqSBNd9UjM6pGM76A",
  authDomain: "letmeask-b9168.firebaseapp.com",
  databaseURL: "https://letmeask-b9168-default-rtdb.firebaseio.com",
  projectId: "letmeask-b9168",
  storageBucket: "letmeask-b9168.appspot.com",
  messagingSenderId: "165283831907",
  appId: "1:165283831907:web:f6d1fe82f352c427505856"
};
 
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const database = firebase.database();
