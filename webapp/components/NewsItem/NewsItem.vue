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
      let item = {...this.item};
      item.votes++;
      this.$emit("updateItem", item);
    },
    downvote: function () {
       let item = {...this.item};
      item.votes--;
      this.$emit("updateItem", item);
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
