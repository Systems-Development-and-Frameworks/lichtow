import { DataSource } from "apollo-datasource";
import crypto from "crypto";

export class Post {
    constructor(data) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.voters = new Map();
        Object.assign(this, data);
    }
}
export class User {
    constructor(name, email, password) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.name = name;
        this.email = email;
        this.password = password;
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

    createUser(name, email, password) {
        const newUser = new User(name, email, password);
        this.users.push(newUser);
        return Promise.resolve(newUser);
    }

    getUser(name) {
        return Promise.resolve(this.users.find((user) => user.name === name));
    }

    allPosts() {
        return Promise.resolve(this.posts);
    }

    getPost(id) {
        return Promise.resolve(this.posts.find((post) => post.id === id));
    }

    createPost(data) {
        const newPost = new Post(data);
        this.posts.push(newPost);
        return Promise.resolve(newPost);
    }

    deletePost(id) {
        const deletedPost = this.getPost(id);
        this.posts = this.posts.filter((post) => post.id !== id);
        return Promise.resolve(deletedPost);
    }

    upvotePost(id, user) {
        return this.getPost(id).then((post) => {
            post.voters.set(user, 1);
            return post;
        });
    }

    downvotePost(id, user) {
        return this.getPost(id).then((post) => {
            post.voters.set(user, -1);
            return post;
        });
    }
}
