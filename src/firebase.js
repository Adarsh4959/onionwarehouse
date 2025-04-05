// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDeYav09Lv0lkPZzMXWI_M-LV7jQbHsdxE",
  authDomain: "onion-warehouse.firebaseapp.com",
  databaseURL: "https://onion-warehouse-default-rtdb.firebaseio.com",
  projectId: "onion-warehouse",
  storageBucket: "onion-warehouse.appspot.com",
  messagingSenderId: "210322070632",
  appId: "1:210322070632:web:5ae1095f96b6e769322fdd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database
const database = getDatabase(app);

export { app, database };
