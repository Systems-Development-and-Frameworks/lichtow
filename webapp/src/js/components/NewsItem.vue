<template>
  <div>
    <div>{{ item.title }} ({{ item.votes }})</div>
    <button @click="upvote" id="upvote">Upvote</button>
    <button @click="downvote" id="downvote">Downvote</button>
    <button @click="remove" id="remove">Remove</button>
  </div>
</template>

<script>
export default {
  props: ["item"],
  methods: {
    upvote: function () {
      this.item.votes++;
    },
    downvote: function () {
      this.item.votes--;
    },
    remove: function () {
      this.$emit("removeItem", this.item);
    },
  },
};
</script>

<style>
</style>
