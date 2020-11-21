import { DataSource } from "apollo-datasource";
import crypto from "crypto";

export class Post {
    constructor(data) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.votes = 0;
        Object.assign(this, data);
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
        return new Promise((resolve) => {
            const newPost = new Post(data);
            this.posts.push(newPost);
            resolve(newPost);
        });
    }
    upvotePost(id, user) {}
}