import { DataSource } from "apollo-datasource";
import crypto from "crypto";

export class Post {
    constructor(data) {
        Object.assign(this, data);
        this.id = crypto.randomBytes(16).toString("hex");
    }
}

export class PostDataSource extends DataSource {
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