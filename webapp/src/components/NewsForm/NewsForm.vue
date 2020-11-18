<template>
  <div>
    <form onsubmit="event.preventDefault();">
      <input type="text" aria-label="Title" v-model="newTitle" placeholder="New Title" />
      <input type="submit" aria-label="Create" value="Create" @click="submit" />
    </form>
  </div>
</template>

<script>
export default {
  methods: {
    submit: function () {
      this.$emit("createItem", this.newTitle);
      this.newTitle = "";
    },
  },
  data: function () {
    return {
      newTitle: "",
    };
  },
};
</script>

<style>
</style>