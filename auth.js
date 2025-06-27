// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Current user state
let currentUser = null;

// Auth state listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateUI();
});

// Sign in with Google
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('User signed in:', result.user.displayName);
  } catch (error) {
    console.error('Error signing in:', error);
    alert('Error signing in. Please try again.');
  }
}

// Sign in with email/password
async function signInWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in:', error);
    alert('Error signing in: ' + error.message);
  }
}

// Create account with email/password
async function createAccount(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error creating account:', error);
    alert('Error creating account: ' + error.message);
  }
}

// Sign out
async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Update UI based on auth state
function updateUI() {
  const authContainer = document.getElementById('authContainer');
  const mainApp = document.querySelector('.container');
  const userInfo = document.getElementById('userInfo');
  
  if (currentUser) {
    // User is signed in
    authContainer.style.display = 'none';
    mainApp.style.display = 'flex';
    userInfo.innerHTML = `
      <div class="user-profile">
        <img src="${currentUser.photoURL || 'https://via.placeholder.com/40'}" alt="Profile" class="profile-pic">
        <span>Welcome, ${currentUser.displayName || currentUser.email}!</span>
        <button onclick="signOutUser()" class="sign-out-btn">Sign Out</button>
      </div>
    `;
  } else {
    // User is signed out
    authContainer.style.display = 'flex';
    mainApp.style.display = 'none';
    userInfo.innerHTML = '';
  }
}

// Make functions available globally
window.signInWithGoogle = signInWithGoogle;
window.signInWithEmail = signInWithEmail;
window.createAccount = createAccount;
window.signOutUser = signOutUser;