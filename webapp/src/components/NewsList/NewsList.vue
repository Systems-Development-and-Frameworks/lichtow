<template>
  <div class="container">
    <div class="news-list">
      <h1 class="news-heading">News List</h1>
      <div v-if="$apollo.queries.posts.loading" class="test-loading">
        Loading...
      </div>
      <div v-for="post in orderedPosts" :key="post.id">
        <NewsItem
          class="news-item"
          @upvote="upvote(post)"
          @downvote="downvote(post)"
          @remove="remove(post)"
          :post="post"
        ></NewsItem>
      </div>
      <div id="emptyListMessage" v-if="!posts.length">The list is empty :(</div>
      <button id="reverseOrder" @click="reverseOrder">Reverse order</button>

      <NewsForm class="news-form" @createItem="createItem"></NewsForm>
    </div>
  </div>
</template>

<script>
import NewsItem from "../NewsItem/NewsItem.vue";
import NewsForm from "../NewsForm/NewsForm.vue";
import GET_POSTS from "../../graphql/Posts.gql";
import WRITE_POST from "../../graphql/WritePost.gql";
import DELETE_POST from "../../graphql/DeletePost.gql";
import UPVOTE_POSTS from "../../graphql/UpvotePost.gql";
import DOWNVOTE_POSTS from "../../graphql/DownvotePost.gql";

//Use default user for now
const DEFAULT_USER = "Jonas";

export default {
  apollo: {
    posts: {
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
      posts: [],
      descending: true,
    };
  },
  methods: {
    upvote: function (post) {
      this.$apollo.mutate({
        mutation: UPVOTE_POSTS,
        variables: {
          id: post.id,
          voter: { name: DEFAULT_USER },
        },
        update: (store, { data: { upvote } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          let upvotedElement = data.posts.find((el) => el.id === upvote.id);
          if (upvotedElement) upvotedElement = upvote;
          store.writeQuery({ query: GET_POSTS, data });
        },
        optimisticResponse: {
          upvote: {
            __typename: "Post",
            id: post.id,
            title: post.title,
            votes: post.votes + 1,
            author: {
              __typename: "User",
              name: DEFAULT_USER,
            },
          },
        },
      });
    },
    downvote: function (post) {
      this.$apollo.mutate({
        mutation: DOWNVOTE_POSTS,
        variables: {
          id: post.id,
          voter: { name: DEFAULT_USER },
        },
        update: (store, { data: { downvote } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          let downvotedElement = data.posts.find((el) => el.id === downvote.id);
          if (downvotedElement) downvotedElement = downvote;
          store.writeQuery({ query: GET_POSTS, data });
        },
        optimisticResponse: {
          downvote: {
            __typename: "Post",
            id: post.id,
            title: post.title,
            votes: post.votes - 1,
            author: {
              __typename: "User",
              name: DEFAULT_USER,
            },
          },
        },
      });
    },
    remove: function (post) {
      this.$apollo.mutate({
        mutation: DELETE_POST,
        variables: {
          id: post.id,
        },
        update: (store, { data: { delete: deleted } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          data.posts = data.posts.filter((el) => el.id !== deleted.id);
          store.writeQuery({ query: GET_POSTS, data });
        },
        optimisticResponse: {
          delete: {
            __typename: "Post",
            id: post.id,
            title: post.title,
            votes: post.votes,
            author: {
              __typename: "User",
              name: DEFAULT_USER,
            },
          },
        },
      });
    },
    createItem: function (newTitle) {
      this.$apollo.mutate({
        mutation: WRITE_POST,
        variables: {
          post: { title: newTitle, author: { name: DEFAULT_USER } },
        },
        update: (store, { data: { write } }) => {
          const data = store.readQuery({ query: GET_POSTS });
          data.posts.push(write);
          store.writeQuery({ query: GET_POSTS, data });
        },
        optimisticResponse: {
          write: {
            __typename: "Post",
            id: this.generateTemporaryId(),
            title: newTitle,
            votes: 0,
            author: {
              __typename: "User",
              name: DEFAULT_USER,
            },
          },
        },
      });
    },
    generateTemporaryId: function () {
      let newId = 1;
      this.posts.forEach((post) => {
        if (post.id >= newId) newId = post.id + 1;
      });
      return newId;
    },
    reverseOrder: function () {
      this.descending = !this.descending;
    },
  },
  computed: {
    orderedPosts: function () {
      let orderedPosts = [...this.posts];
      let compareVotes = (a, b) => b.votes - a.votes;
      if (this.descending) {
        return orderedPosts.sort(compareVotes);
      } else {
        return orderedPosts.sort(compareVotes).reverse();
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
