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
        this.posts = [];
    }
}

export class InMemoryDataSource extends DataSource {
    constructor() {
        super();
        this.posts = [];
        this.users = [new User("Jonas"), new User("Paula")];
    }

    initialize({ context }) {}

    allUsers() {
        return this.users;
    }

    allPosts() {
        return this.posts;
    }
    createPost(data) {
        return new Promise((resolve, reject) => {
            const authorIndex = this.users.findIndex(user => user.name === data.authorName);
            if(authorIndex >= 0) {
                const newPostData = {
                    title: data.title,
                    author: this.users[authorIndex],
                };
                const newPost = new Post(newPostData);
                this.posts.push(newPost);
                this.users[authorIndex].posts.push(newPost);
                resolve(newPost);
            } else {
                reject();
            }
        });
    }

    upvotePost(id, user) {}
}
