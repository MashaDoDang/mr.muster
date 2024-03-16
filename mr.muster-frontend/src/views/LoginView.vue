<template>
  <div>
    <h2>Login</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="handleLogin">Login</button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/AuthenticationService'; // Adjust the path as necessary

export default {
  name: 'LoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const handleLogin = async () => {
      try {
        await login(email.value, password.value);
        router.push('/'); // Redirect to the root path after successful login
      } catch (error) {
        alert(error.message);
      }
    };

    return {
      email,
      password,
      handleLogin
    };
  }
};
</script>
  