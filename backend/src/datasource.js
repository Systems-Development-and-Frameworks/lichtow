import { DataSource } from "apollo-datasource";
import { rejects } from "assert";
import crypto from "crypto";

export class Post {
    constructor(data) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.votes = 0;
        Object.assign(this, data);
    }
}
export class User {
    constructor(name) {
        this.name = name;
    }
}

export class InMemoryDataSource extends DataSource {
    constructor() {
        super();
        this.posts = [];
        this.users = [];
    }

    initialize({ context }) {}

    allUsers() {
        return Promise.resolve(this.users);
    }

    getUser(name) {
        return Promise.resolve(this.users.find((user) => user.name === name));
    }

    allPosts() {
        return Promise.resolve(this.posts);
    }
    createPost(data) {
        const newPost = new Post(data);
        this.posts.push(newPost);
        return Promise.resolve(newPost);
    }

    upvotePost(id, user) {}
}
