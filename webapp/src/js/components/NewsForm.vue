<template>
  <div>
    <form onsubmit="event.preventDefault();">
      <input type="text" v-model="newTitle" placeholder="New Title" />
      <input type="submit" value="Create" @click="submit" />
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