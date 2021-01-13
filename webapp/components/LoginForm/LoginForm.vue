<template>
  <div>
    <div v-if="isAuthenticated">You are Logged in</div>
    <form onsubmit="event.preventDefault();">
      <input
        type="email"
        aria-label="Email"
        v-model="email"
        placeholder="Email"
      />
      <input
        type="password"
        aria-label="Password"
        v-model="password"
        placeholder="Password"
      />
      <div v-if="invalidCredentials">Falsche Email oder Passwort</div>
      <input type="submit" aria-label="Login" value="Login" @click="login" />
    </form>
  </div>
</template>

<script>
import login from "../../gql/login.gql";
export default {
  computed: {
    isAuthenticated: function () {
      return !!this.$apolloHelpers.getToken();
    },
  },
  methods: {
    login: async function () {
      await this.$apollo
        .mutate({
          mutation: login,
          variables: { email: this.email, password: this.password },
        })
        .then(({ data }) => {
          this.$apolloHelpers.onLogin(data.login).then(() => {
            this.invalidCredentials = false;
            this.isAuthenticated = true;
          });
          console.log("You are logged in");
        })
        .catch(() => (this.invalidCredentials = true));
    },
  },
  data: function () {
    return {
      email: "",
      password: "",
      invalidCredentials: false,
    };
  },
};
</script>

<style>
</style>