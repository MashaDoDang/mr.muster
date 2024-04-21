<template>
    <div class="login-overlay">
      <div class="login-modal">
        <form>
          <input type="text" class="form-control mb-3" placeholder="E-mail" v-model="email">
          <div v-if="!resetPasswordRef" style="display: grid;">
            <input type="password" class="form-control mb-3" placeholder="Password" v-model="password">
            <button class="btn btn-primary mb-3" type="button" @click="handleLogin">
                Log in
            </button>
            <button class="btn btn-primary mb-3" type="button" @click="resetPasswordRef = true;">Forgot Password?</button>
            <button class="btn btn-primary mb-3" type="button">Create a new account</button>
            <div class="separator my-3"></div>
            <div style="display: grid;">
                <button class="btn btn-primary mb-3" type="button" @click="signInWithGoogle()">
                    <!-- <img src="@/assets/google-icon.png" alt="Google sign-in" class="google-icon"> -->
                    Sign in with Google
                </button>
                <button class="btn btn-primary mb-3" type="button" @click="closeModal()">
                    Close
                </button>
            </div>
          </div>
        </form>
        <div v-if="resetPasswordRef" style="display: flex; justify-content: space-evenly; gap: 5px;">
            <button @click="resetPasswordRef = false;" class="btn btn-primary mb-3" type="button" style="flex: 1;">Cancel</button>
            <button @click="resetPassword()" class="btn btn-primary mb-3" type="button" style="flex: 1;">Send</button>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref, defineEmits } from 'vue';
import { auth } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const emit = defineEmits(['close']);

const email = ref('');
const password = ref('');
const resetPasswordRef = ref(false);
const provider = new GoogleAuthProvider();

function closeModal() {
  emit('close');
}

async function handleLogin() {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    closeModal(); // Close modal on successful login
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = getFirebaseErrorMessage(error);
    alert(errorMessage); // Display the error message to the user
  }
}

function getFirebaseErrorMessage(error) {
  const errorCode = error.code;
  switch (errorCode) {
    case 'auth/invalid-email':
      return "The email address is not valid.";
    case 'auth/user-disabled':
      return "This user has been disabled.";
    case 'auth/user-not-found':
      return "No user corresponding to the given email.";
    case 'auth/wrong-password':
      return "Wrong password. Please try again.";
    case 'auth/missing-password':
      return "Please enter your password.";
    case 'auth/invalid-password':
      return "The password is invalid or too weak.";
    case 'auth/email-already-in-use':
      return "This email is already in use by another account.";
    case 'auth/operation-not-allowed':
      return "Email/password accounts are not enabled.";
    case 'auth/too-many-requests':
      return "We have blocked all requests from this device due to unusual activity. Try again later.";
    case 'auth/invalid-credential':
      return "The credential data provided is invalid.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

async function resetPassword() {
  if (email.value.trim() === '') {
    alert("Please enter your email address.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email.value);
    alert("Reset password email sent. Please check your inbox.");
    closeModal();
  } catch (error) {
    console.error('Password reset error:', error);
    const errorMessage = getFirebaseErrorMessage(error);
    alert(errorMessage); // Display the error message to the user // Show error message to the user
  }
}

async function signInWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
        closeModal(); // Close modal on successful login
    } catch (error) {
        console.error('Login error:', error);
        alert(getFirebaseErrorMessage(error)); // Display the error message to the user
    }
}
</script>


  
  <style scoped>
  .login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Dark transparent overlay */
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .login-modal {
    background-color: black;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
  }
  
  .separator {
    height: 1px;
    background-color: #ccc;
  }
  
  .google-icon {
    width: 20px;
    margin-right: 5px;
  }
  </style>
  