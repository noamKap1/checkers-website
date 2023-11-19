import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBP_fKrVnq3c8A6TXiST-wqMbRVaNbblYo",
  authDomain: "gfgn-a4231.firebaseapp.com",
  projectId: "gfgn-a4231",
  storageBucket: "gfgn-a4231.appspot.com",
  messagingSenderId: "30837964558",
  appId: "1:30837964558:web:6bc641608929d4845f615f",
  measurementId: "G-E4HYS88WK5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app); 