<template>
  <div class="container">
    <div class="news-list">
      <h1 class="news-heading">News List</h1>
      <div v-for="item in orderedItems" :key="item.id">
        <NewsItem
          class="news-item"
          @upvote="upvote(item)"
          @downvote="downvote(item)"
          @remove="remove(item)"
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
import GET_POSTS from "../../gql/Posts.gql";
import WRITE_POST from "../../gql/WritePost.gql";
import DELETE_POST from "../../gql/DeletePost.gql";
import UPVOTE_POST from "../../gql/UpvotePost.gql";
import DOWNVOTE_POST from "../../gql/DownvotePost.gql";
export default {
  apollo: {
    items: {
      query: GET_POSTS,
      update({ posts }) {
        return posts;
      },
    },
  },
  name: "app",
  components: {
    NewsItem,
    NewsForm,
  },
  data: function () {
    return {
      items: [],
      descending: true,
    };
  },
  mounted: function () {
    this.setToken(this.$apolloHelpers.getToken());
  },
  methods: {
    ...mapMutations(["setToken"]),
    upvote(item) {
      this.$apollo.mutate({
        mutation: UPVOTE_POST,
        variables: {
          id: item.id,
        },
      });
    },
    downvote(item) {
      this.$apollo.mutate({
        mutation: DOWNVOTE_POST,
        variables: {
          id: item.id,
        },
      });
    },
    remove(item) {
      this.$apollo.mutate({
        mutation: DELETE_POST,
        variables: {
          id: item.id,
        },
        update: (store, { data: { delete: deleted } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          data.posts = data.posts.filter((el) => el.id !== deleted.id);
          store.writeQuery({ query: GET_POSTS, data });
        },
      });
    },
    createItem(newTitle) {
      this.$apollo.mutate({
        mutation: WRITE_POST,
        variables: {
          post: { title: newTitle },
        },
        update: (store, { data: { write } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          data.posts.push(write);
          store.writeQuery({ query: GET_POSTS, data });
        },
      });
    },
    reverseOrder() {
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
