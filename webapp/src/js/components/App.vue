<template>
  <div class="container">
    <div class="news-list">
      <h1 class="news-heading">News List</h1>
      <div v-for="item in orderedItems" :key="item.id">
        <NewsItem
          class="news-item"
          @removeItem="removeItem(item)"
          :item="item"
        ></NewsItem>
      </div>

      <NewsForm class="news-form" @createItem="createItem"></NewsForm>
    </div>
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
      let newId = this.generateNewId();
      this.items = [...this.items, { id: newId, title: newTitle, votes: 0 }];
    },
    generateNewId: function () {
      let newId = 1;
      this.items.forEach((item) => {
        if (item.id >= newId) newId = item.id + 1;
      });
      return newId;
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
.container {
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  justify-content: center;
}
.news-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.news-item {
  padding: 15px 0;
}
.news-form {
  padding: 50px 0;
}
</style>
