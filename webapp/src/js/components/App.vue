<template>
  <div>
    <h1>News List</h1>
    <div v-for="item in orderedItems" :key="item.id">
      <NewsItem
        @updateItem="updateItem"
        @removeItem="removeItem(item)"
        :item="item"
      ></NewsItem>
    </div>

    <NewsForm @createItem="createItem"></NewsForm>
  </div>
</template>

<script>
import NewsItem from "./NewsItem.vue";
import NewsForm from "./NewsForm.vue";
export default {
  name: "app",
  components: {
    NewsItem,
    NewsForm,
  },
  methods: {
    updateItem: function () {
      console.log("@updateItem");
    },
    removeItem: function (item) {
      if (item && item.id) {
        this.items = this.items.filter((el) => el.id !== item.id);
      }
    },
    compareVotes: function (a, b) {
      if (a.votes < b.votes) {
        return 1;
      }
      if (a.votes > b.votes) {
        return -1;
      }
      return 0;
    },
    createItem: function (newTitle) {

    },
  },
  computed: {
    orderedItems: function () {
      return this.items.sort(this.compareVotes);
    },
  },
  data: function () {
    return {
      items: [
        { id: 1, title: "VueJS", votes: 0 },
        { id: 2, title: "Hello world!", votes: 0 },
      ],
    };
  },
};
</script>

<style>
</style>
