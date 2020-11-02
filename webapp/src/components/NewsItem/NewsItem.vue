<template>
  <div>
    <div class="item-title">{{ item.title }} ({{ item.votes }})</div>
    <div class="item-buttons">
      <button @click="upvote" id="upvote">Upvote</button>
      <button @click="downvote" id="downvote">Downvote</button>
      <button @click="remove" id="remove">Remove</button>
    </div>
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
.item-title {
  font-size: 24px;
  text-align: center;
}
.item-buttons {
  padding: 15px 0;
}
</style>
