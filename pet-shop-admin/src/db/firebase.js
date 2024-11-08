// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmKzrjgvhbc15vIquwKBEBu_CF_YPL3qQ",
  authDomain: "capstone-e2611.firebaseapp.com",
  projectId: "capstone-e2611",
  storageBucket: "capstone-e2611.appspot.com",
  messagingSenderId: "313845517374",
  appId: "1:313845517374:web:c11b240b5aeec84f78956f",
  measurementId: "G-6T5F6FGH6K",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
export { db, storage, auth };
