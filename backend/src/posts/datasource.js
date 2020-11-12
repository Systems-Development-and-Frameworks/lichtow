const { DataSource } = require("apollo-datasource");

class PostDataSource extends DataSource {
    constructor() {
        super();
        this.posts = [
            {
                id: 1,
                title: "Vue",
                votes: 0,
            },
            {
                id: 2,
                title: "Jurassic Park",
                votes: 2,
            },
        ];
    }

    initialize({ context }) {}

    allPosts() {
        return this.posts;
    }
    createPost(data) {}
    upvotePost(id, user) {}
}
module.exports = {
    PostDataSource
}
