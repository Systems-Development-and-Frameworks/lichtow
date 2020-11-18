import { DataSource } from "apollo-datasource";
import crypto from "crypto";

export class Post {
    constructor(data) {
        Object.assign(this, data);
        this.id = crypto.randomBytes(16).toString("hex");
    }
}

export class InMemoryDataSource extends DataSource {
    constructor() {
        super();
        this.posts = [];
    }

    initialize({ context }) {}

    allPosts() {
        return this.posts;
    }
    createPost(data) {
        const newPost = new Post(data);
        this.posts.push(newPost);
        return newPost;
    }
    upvotePost(id, user) {}
}