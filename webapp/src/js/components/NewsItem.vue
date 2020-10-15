<template>
  <div>
    <div>{{ item.title }} ({{ item.votes }})</div>
    <button @click="upvote" id="upvote">Upvote</button>
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
  },
};
</script>

<style>
</style>
