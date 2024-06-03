<template>
  <div class="login-overlay">
    <div class="login-modal">
      <button class="btn-primary mb-3 btn-close" type="button" @click="closeModal()"></button>
      <form>
        <p class="modal-header" v-if="!resetPasswordRef && !registerModeRef">
          Login
        </p>
        <p class="modal-header" v-if="resetPasswordRef">Reset Password</p>
        <p class="modal-header" v-if="registerModeRef">Register</p>
        <div class="register-form">
          <input data-cy="username-input" type="text" class="form-control mb-3" placeholder="Username" v-model="username"
            v-if="registerModeRef" />
          <input data-cy="email-input" type="email" class="form-control mb-3" placeholder="E-mail" v-model="email" />
          <input data-cy="password-input" type="password" class="form-control mb-3" placeholder="Password" v-model="password"
            v-if="!resetPasswordRef" />
          <input data-cy="confirm-password-input" type="password" class="form-control mb-3" placeholder="Confirm password" v-model="confirmPassword"
            v-if="!resetPasswordRef && registerModeRef" />
        </div>
        <div v-if="!resetPasswordRef && !registerModeRef" style="display: grid">
          <button data-cy="forgot-button" class="btn-forgot-passwrd" type="button" @click="resetPasswordRef = true">
            Forgot Password?
          </button>
          <button data-cy="confirm-login" class="btn btn-primary btn-orange mb-3" type="button" @click="handleLogin">
            Log in
          </button>
          <button data-cy="create-new-button" class="btn btn-primary btn-yellow mb-3" type="button" @click="registerModeRef = true">
            Create a new account
          </button>
          <div class="separator my-3"></div>
          <div style="display: grid">
            <button data-cy="google-login-button" class="btn btn-primary mb-3 btn-google" type="button" @click="signInWithGoogle()">
              <img src="@/assets/google-icon.webp" alt="Google sign-in" class="google-icon" />
              Sign in with Google
            </button>
          </div>
        </div>
      </form>
      <div style="display: flex; justify-content: space-evenly; gap: 5px">
        <button data-cy="cancel-button" @click="
        resetPasswordRef = false;
      registerModeRef = false;
      " class="btn btn-primary mb-3 btn-yellow" type="button" style="flex: 1"
          v-if="resetPasswordRef || registerModeRef">
          Cancel
        </button>
        <button data-cy="send-reset-button" @click="resetPassword()" class="btn btn-primary mb-3 btn-orange" type="button" style="flex: 1"
          v-if="resetPasswordRef">
          Send
        </button>
        <button data-cy="create-account-button" @click="registerUser()" class="btn btn-primary mb-3 btn-orange" type="submit" style="flex: 1"
          v-if="registerModeRef">
          Create Account
        </button>
      </div>
      <div class="separator my-3" v-if="registerModeRef"></div>
      <button data-cy="google-login-button" class="btn btn-primary mb-3 btn-google" type="button" style="width: 100%" @click="signInWithGoogle()"
        v-if="registerModeRef">
        <img src="@/assets/google-icon.webp" alt="Google sign-in" class="google-icon" />
        Sign in with Google
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, watch, defineProps } from "vue";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";


const props = defineProps({
  registerMode: Boolean,
});

const emit = defineEmits(["close"]);

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const resetPasswordRef = ref(false);
const provider = new GoogleAuthProvider();
const registerModeRef = ref(props.registerMode);
const username = ref("");

watch(
  () => props.registerMode,
  (newVal) => {
    registerModeRef.value = newVal;
  }
);

function closeModal() {
  resetPasswordRef.value = false;
  registerModeRef.value = false;
  emit("close");
}

async function handleLogin() {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    closeModal(); // Close modal on successful login
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = getFirebaseErrorMessage(error);
    alert(errorMessage); // Display the error message to the user
  }
}

async function resetPassword() {
  if (email.value.trim() === "") {
    alert("Please enter your email address.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email.value);
    alert("Reset password email sent. Please check your inbox.");
    closeModal();
  } catch (error) {
    console.error("Password reset error:", error);
    const errorMessage = getFirebaseErrorMessage(error);
    alert(errorMessage); // Display the error message to the user // Show error message to the user
  }
}

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    
    const userDocRef = doc(db, "Users", result.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // User doesn't exist in Firestore, so add them
      await setDoc(userDocRef, {
        Email: result.user.email,
        FollowedBy: [],
        Follows: [],
        Icon: result.user.photoURL || "",
        LikedPosts: [],
        OwnedGrids: [],
        Username: result.user.displayName,
        isAdmin: false
      });
    }

    closeModal(); // Close modal on successful login
  } catch (error) {
    console.error("Login error:", error);
    alert(getFirebaseErrorMessage(error)); // Display the error message to the user
  }
}

function registerUser() {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match.");
    return;
  }

  if (
    password.value === "" ||
    confirmPassword.value === "" ||
    email.value === ""
  ) {
    alert("Please fill out all fields.");
    return;
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // User created successfully
      // Here you can close the modal or redirect the user as needed
      console.log("User registered:", userCredential.user);
      closeModal();
      alert(`Welcome ${username.value}! \n\nYour account has been created!`);

      // Add the user to Firestore
      setDoc(doc(db, "Users", userCredential.user.uid), {
        Email: email.value,
        FollowedBy: [],
        Follows: [],
        Icon: "",
        LikedPosts: [],
        OwnedGrids: [],
        Username: username.value,
        isAdmin: false
      });
      console.log("User added to Firestore.");
    })
    .catch((error) => {
      console.error("Registration error:", error);
      alert(getFirebaseErrorMessage(error)); // Display the error message to the user
    });
}

function getFirebaseErrorMessage(error) {
  const errorCode = error.code;
  switch (errorCode) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This user has been disabled.";
    case "auth/user-not-found":
      return "No user corresponding to the given email.";
    case "auth/wrong-password":
      return "Wrong password. Please try again.";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/invalid-password":
      return "The password is invalid or too weak.";
    case "auth/email-already-in-use":
      return "This email is already in use by another account.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/too-many-requests":
      return "We have blocked all requests from this device due to unusual activity. Try again later.";
    case "auth/invalid-credential":
      return "The credential data provided is invalid.";
    default:
      return "An unexpected error occurred. Please try again.";
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
  background-color: rgba(0, 0, 0, 0.5);
  /* Dark transparent overlay */
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-modal {
  background-color: rgb(255, 255, 255);
  padding: 40px 30px;
  border-radius: 30px;
  width: 400px;
}

.separator {
  height: 1px;
  background-color: #ccc;
}

.btn {
  font-size: 16px;
  border-radius: 40px;
  /* Zmiana koloru tekstu */
}

.btn-orange {
  background-color: #d95b00;
  border-color: #d95b00;
  color: white;
}

.btn-yellow {
  border-color: #fbc46a;
  color: #fbc46a;
  background-color: rgb(248, 248, 248);
}

.btn-google {
  background-color: #ffffff;
  border-color: #b0b0b0;
  color: #b0b0b0;
}

.modal-header {
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 500;
  justify-content: center;
  align-items: center;
}

.btn-close {
  display: inline;
  left: 160px;
  bottom: 10px;
  position: relative;
}

.btn-forgot-passwrd {
  margin-bottom: 25px;
}

.register-form {
  margin-bottom: 35px;
}

.google-icon {
  width: 20px;
  margin-right: 5px;
}
</style>
