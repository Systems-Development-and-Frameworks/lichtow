<template>
  <div>
    <template v-if="loggedIn">
      <button id="logoutBtn" @click="logout">Logout</button>
    </template>
    <template v-else>
      <NuxtLink to="/login">Login</NuxtLink>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapGetters(["loggedIn"]),
  },
  methods: {
    ...mapActions(["logout"]),
  },
};
</script>

<style>
</style>