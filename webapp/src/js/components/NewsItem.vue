<template>
  <div>
    <div>{{ item.title }} ({{ item.votes }})</div>
    <button @click="upvote" id="upvote">Upvote</button>
    <button @click="downvote" id="downvote">Downvote</button>
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
  },
};
</script>

<style>
</style>
