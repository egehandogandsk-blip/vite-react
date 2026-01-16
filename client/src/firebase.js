import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBoB9ae2sPpPYXCH_4a6OVpSRflafm2nvQ",
    authDomain: "boardgame-6c152.firebaseapp.com",
    projectId: "boardgame-6c152",
    storageBucket: "boardgame-6c152.firebasestorage.app",
    messagingSenderId: "1027813061088",
    appId: "1:1027813061088:web:52b9f70071474cb1d93b85",
    databaseURL: "https://boardgame-6c152-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
