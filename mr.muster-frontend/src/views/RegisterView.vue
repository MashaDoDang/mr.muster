<template>
  <div>
    <h2>Sign Up</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="handleSignup">Sign Up</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signup } from '../services/AuthenticationService';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const handleSignup = async () => {
      try {
        await signup(email.value, password.value);
        alert('Signup successful');
        router.push('/login');
      } catch (error) {
        alert(error.message);
      }
    };

    return {
      email,
      password,
      handleSignup
    };
  }
};
</script>
