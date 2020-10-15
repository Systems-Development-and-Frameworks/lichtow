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
      this.$emit("updateItem");
    },
    downvote: function () {
      this.item.votes--;
      this.$emit("updateItem");
    },
    remove: function () {
      this.$emit("removeItem", this.item);
    },
  },
};
</script>

<style>
</style>
