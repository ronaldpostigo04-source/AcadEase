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

// REPLACE YOUR OLD CONFIG WITH THIS:
const firebaseConfig = {
    apiKey: "AIzaSy...",  // copy exact from console
    authDomain: "acadease-64c51.firebaseapp.com",  // importante to!
    projectId: "acadease-64c51",
    storageBucket: "acadease-64c51.appspot.com",
    messagingSenderId: "775178252024",
    appId: "1:775178252024:web:abd2426e9f8e4775d6d4"
};

// Initialize Firebase
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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in:", user.email);
    } else {
        console.log("User logged out");
    }
});