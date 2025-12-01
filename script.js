document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section, .card').forEach(el => observer.observe(el));

// Test if a specific user can login
testLogin("test@example.com", "password123");

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-a3J3dzyG_e4TipaUDRNuWBcH3YM0bVo",
  authDomain: "acadease-bdf1a.firebaseapp.com",
  projectId: "acadease-bdf1a",
  storageBucket: "acadease-bdf1a.firebasestorage.app",
  messagingSenderId: "1014553842484",
  appId: "1:1014553842484:web:479ff337b2ccdbf2214b61",
  measurementId: "G-2T9MFXHJJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { db } from './firebase-config.js';
import { collection, addDoc } from "firebase/firestore";

// Add document
async function addData() {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

import { collection, getDocs } from "firebase/firestore";

async function getData() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
}

// app.js
import { addData, getData } from './firestore-operations.js';

window.addUser = addData;
window.getUsers = getData;

// Initialize
getData();