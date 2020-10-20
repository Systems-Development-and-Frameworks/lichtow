<template>
  <div>
    <form onsubmit="event.preventDefault();">
      <input type="text" v-model="newTitle" placeholder="New Title">
      <input type="submit" value="Create" @click="submit">
      <p>New Title is: {{ newTitle }}</p>
    </form>
  </div>
</template>

<script>
export default {
  methods: {
    submit: function () {
      this.$emit("createItem", this.newTitle);
    },
  },
  data: function () {
    return {
      newTitle: ""
    };
  },

};
</script>

<style>
</style>