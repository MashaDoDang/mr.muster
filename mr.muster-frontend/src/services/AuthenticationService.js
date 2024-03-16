import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

// Sign up function
const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login function
const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign out function
const logout = () => {
  return signOut(auth);
};

export { signup, login, logout };
