<template>
  <div>
    <h1>News List</h1>
    <div v-for="item in items" :key="item.title">
      <NewsItem @updateItem="orderItems" :item="item"></NewsItem>
    </div>
  </div>
</template>

<script>
import NewsItem from "./NewsItem.vue";
export default {
  name: "app",
  components: {
    NewsItem,
  },
  methods: {
    orderItems: function () {
      console.log("@orderItems");
    },
  },
  data: function () {
    return {
      items: [
        { title: "VueJS", votes: 0 },
        { title: "Hello world!", votes: 0 },
      ],
    };
  },
};
</script>

<style>
</style>
