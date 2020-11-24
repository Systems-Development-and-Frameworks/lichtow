<template>
  <div>
    <div class="post-title">{{ post.title }} ({{ post.votes }})</div>
    <div class="post-buttons">
      <button @click="upvote">Upvote</button>
      <button @click="downvote">Downvote</button>
      <button @click="remove">Remove</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["post"],
  methods: {
    upvote: function () {
      this.$emit("upvote");
    },
    downvote: function () {
      this.$emit("downvote");
    },
    remove: function () {
      this.$emit("remove", this.post);
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
