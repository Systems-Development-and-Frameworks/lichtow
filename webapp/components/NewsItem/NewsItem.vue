<template>
  <div>
    <div class="item-title">{{ item.title }} ({{ item.votes }})</div>
    <div class="item-buttons">
      <button @click="upvote">Upvote</button>
      <button @click="downvote">Downvote</button>
      <button @click="remove">Remove</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["item"],
  methods: {
    upvote: function () {
      this.$emit("upvote");
    },
    downvote: function () {
      this.$emit("downvote");
    },
    remove: function () {
      this.$emit("remove", this.item);
    },
  },
};
</script>

<style>
.post-title {
  font-size: 24px;
  text-align: center;
}
.post-buttons {
  padding: 15px 0;
}
</style>
