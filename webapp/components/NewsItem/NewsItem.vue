<template>
  <div>
    <div class="item-title">{{ item.title }} ({{ item.votes }})</div>
    <div class="item-buttons">
      <button v-if="loggedIn" @click="upvote">Upvote</button>
      <button v-if="loggedIn" @click="downvote">Downvote</button>
      <button v-if="isAuthor" @click="remove">Remove</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
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
  computed: {
    ...mapGetters(["loggedIn"]),
    ...mapState(["currentUser"]),
    isAuthor: function () {
      return this.currentUser === this.item.author.id;
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
