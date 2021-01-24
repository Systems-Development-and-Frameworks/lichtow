<template>
  <div class="container">
    <div class="news-list">
      <h1 class="news-heading">News List</h1>
      <div v-for="item in orderedItems" :key="item.id">
        <NewsItem
          class="news-item"
          @updateItem="updateItem"
          @removeItem="removeItem"
          :item="item"
        ></NewsItem>
      </div>
      <div id="emptyListMessage" v-if="items.length === 0">
        The list is empty :(
      </div>
      <button id="reverseOrder" @click="reverseOrder">Reverse order</button>

      <NewsForm class="news-form" @createItem="createItem"></NewsForm>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import NewsItem from "../NewsItem/NewsItem.vue";
import NewsForm from "../NewsForm/NewsForm.vue";
export default {
  name: "app",
  components: {
    NewsItem,
    NewsForm,
  },
  props: {
    initialItems: {
      type: Array,
      default: () => {
        return [
          { id: 1, title: "VueJS", votes: 0 },
          { id: 2, title: "Hello world!", votes: 0 },
        ];
      },
    },
  },
  data: function () {
    return {
      items: [...this.initialItems],
      descending: true,
    };
  },
  mounted: function () {
    this.setToken(this.$apolloHelpers.getToken());
  },
  methods: {
    ...mapMutations(["setToken"]),
    updateItem: function (item) {
      if (item && item.id) {
        this.items = this.items.filter((el) => el.id !== item.id);
        this.items = [...this.items, item];
      }
    },
    removeItem: function (item) {
      if (item && item.id) {
        this.items = this.items.filter((el) => el.id !== item.id);
      }
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
    reverseOrder: function () {
      this.descending = !this.descending;
    },
  },
  computed: {
    orderedItems: function () {
      let orderedItems = [...this.items];
      let compareVotes = (a, b) => b.votes - a.votes;
      if (this.descending) {
        return orderedItems.sort(compareVotes);
      } else {
        return orderedItems.sort(compareVotes).reverse();
      }
    },
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
