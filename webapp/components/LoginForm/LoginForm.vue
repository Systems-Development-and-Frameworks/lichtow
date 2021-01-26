<template>
  <div>
    <form onsubmit="event.preventDefault();">
      <input
        id="email"
        type="email"
        aria-label="Email"
        v-model="email"
        placeholder="Email"
      />
      <input
        id="password"
        type="password"
        aria-label="Password"
        v-model="password"
        placeholder="Password"
      />
      <div id="invCredentialsMsg" v-if="invalidCredentials">
        Falsche Email oder Passwort
      </div>
      <input
        id="submit"
        type="submit"
        aria-label="Login"
        value="Login"
        @click="submit"
      />
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
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