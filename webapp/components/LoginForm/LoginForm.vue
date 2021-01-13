<template>
  <div>
    <form onsubmit="event.preventDefault();">
      <input type="email" aria-label="Email" v-model="email" placeholder="Email" />
      <input type="password" aria-label="Password" v-model="password" placeholder="Password" />
      <input type="submit" aria-label="Login" value="Login" @click="login" />
    </form>
  </div>
</template>

<script>
export default {
  methods: {
    login: function () {
        // TODO: login mutation and JWT token
    },
  },
  data: function () {
    return {
      email: "",
      password: ""
    };
  },
};
</script>

<style>
</style>