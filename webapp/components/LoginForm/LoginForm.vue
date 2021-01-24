<template>
  <div>
    <div v-if="loggedIn">You are Logged in</div>
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
      <input type="submit" aria-label="Login" value="Login" @click="submit" />
    </form>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
export default {
  computed: {
    ...mapGetters(["loggedIn"]),
    ...mapState(["currentUser"]),
  },
  methods: {
    ...mapActions(["login"]),
    submit: async function () {
      try {
        await this.login({
          email: this.email,
          password: this.password,
          apolloClient: this.$apollo,
        });
        this.$router.push({
          path: "/",
        });
        this.invalidCredentials = false;
      } catch (error) {
        this.invalidCredentials = true;
      }
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