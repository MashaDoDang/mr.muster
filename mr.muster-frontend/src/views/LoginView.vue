<template>
  <div class="login-background">
    <v-app>
      <v-main class="fill-height">
        <v-container fill-height>
          <v-row align="center" justify="center" class="fill-height">
            <v-col cols="12" sm="8" md="4" class="d-flex align-self-center">
              <v-card class="elevation-12" outlined>
                <v-toolbar color="transparent" flat>
                  <v-toolbar-title>Login</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      label="Email"
                      name="email"
                      type="email"
                      required
                      v-model="email"
                    ></v-text-field>
                    <v-text-field
                      label="Password"
                      name="password"
                      required
                      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="showPassword = !showPassword"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                    ></v-text-field>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="success" block @click="handleLogin">Login</v-btn> <!-- Add event listener -->
                    </v-card-actions>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text color="primary">Forgot password?</v-btn>
                      <v-btn text color="primary">Register</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/AuthenticationService'; // Adjust the path as necessary

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false); // To toggle password visibility
    const router = useRouter();
    const error = ref(null); // To store login errors

    const handleLogin = async () => {
      try {
        await login(email.value, password.value);
        router.push('/'); // Redirect to the homepage or dashboard after login
      } catch (err) {
        error.value = err.message; // Display the error message from Firebase
      }
    };

    return { email, password, showPassword, handleLogin, error };
  },
};
</script>
  
<style >
.login-background {
  background-image: url('../assets/pinetrees.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute; /* Position it absolutely to cover everything */
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: -1; 
}

.v-application {
  background: transparent !important;
}

.v-application--wrap {
  background: none !important;
}

.fill-height {
  min-height: 75vh; /* Fill at least 75% of the screen's height */
}

.elevation-12 {
  max-width: 600px; /* Set a max-width if desired */
  width: 100%; /* Make the card responsive */
}
</style>