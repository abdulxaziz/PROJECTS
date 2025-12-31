import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// 🔴 PASTE YOUR FIREBASE CONFIG HERE 🔴
const firebaseConfig = {
  apiKey:"AIzaSyD5uDlSxquQJhJwqegSqSZp_FGZtRmo7GY",
  authDomain: "art-gallery-16.firebaseapp.com",
  projectId: "art-gallery-16",
  storageBucket: "art-gallery-16.firebasestorage.app",
  messagingSenderId: "588179110590",
  appId: "1:588179110590:web:edc3c7ef35b7263b13bcef",
  measurementId: "G-T8VB4QQ7F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };