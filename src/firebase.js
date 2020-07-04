import firebase from 'firebase/app';
import database from 'firebase/database';

const config = {
    apiKey: "AIzaSyBlTGrV3AizjehxmaCm70q3rgmej5ssLsE",
    authDomain: "personal-site-2385d.firebaseapp.com",
    databaseURL: "https://personal-site-2385d.firebaseio.com",
    projectId: "personal-site-2385d",
    storageBucket: "personal-site-2385d.appspot.com",
    messagingSenderId: "764154412758",
    appId: "1:764154412758:web:4923e1097e149d60e5d377",
    measurementId: "G-K90GWJK1XT"
};

let firebaseCache;

export const getFirebase = () => {
    if (firebaseCache) {
        return firebaseCache;
    }

    firebase.initializeApp(config);
    firebaseCache = firebase;
    return firebase;
};
