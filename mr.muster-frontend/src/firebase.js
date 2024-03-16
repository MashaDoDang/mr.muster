// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdg60T-4TgM3GcWXBdhWxrbRDxr5ZNI8s",
  authDomain: "mrmuster.firebaseapp.com",
  projectId: "mrmuster",
  storageBucket: "mrmuster.appspot.com",
  messagingSenderId: "1067931396506",
  appId: "1:1067931396506:web:2e5212ccd18488d4007223",
  measurementId: "G-0BZ37WCKX0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
