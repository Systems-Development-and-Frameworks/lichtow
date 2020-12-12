import { DataSource } from "apollo-datasource";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const saltRounds = 10;

export class Post {
    constructor(title, authorId) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.voters = new Map();
        this.title = title;
        this.authorId = authorId;
    }
}
export class User {
    constructor(name, email, password) {
        this.id = crypto.randomBytes(16).toString("hex");
        this.name = name;
        this.email = email;
        this.password = password;
    }
    static async build(name, email, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return new User(name, email, hashedPassword);
    }
}

export class Neo4JDataSource extends DataSource {
    constructor() {
        super();
        this.posts = [];
        this.users = [];
    }

    initialize({ context }) {
        this.driver = context.driver;
    }

    allUsers() {
        return Promise.resolve(this.users);
    }

    async createUser(name, email, password) {
        const newUser = await User.build(name, email, password);
        this.users.push(newUser);
        return Promise.resolve(newUser);
    }

    getUser(userId) {
        return Promise.resolve(this.users.find((user) => user.id === userId));
    }

    getUserByEmail(email) {
        return Promise.resolve(this.users.find((user) => user.email === email));
    }

    allPosts() {
        return Promise.resolve(this.posts);
    }

    getPost(postId) {
        return Promise.resolve(this.posts.find((post) => post.id === postId));
    }

    createPost(title, authorId) {
        const newPost = new Post(title, authorId);
        this.posts.push(newPost);
        return Promise.resolve(newPost);
    }

    deletePost(postId) {
        const deletedPost = this.getPost(postId);
        this.posts = this.posts.filter((post) => post.id !== postId);
        return Promise.resolve(deletedPost);
    }

    upvotePost(postId, userId) {
        return this.getPost(postId).then((post) => {
            post.voters.set(userId, 1);
            return post;
        });
    }

    downvotePost(postId, userId) {
        return this.getPost(postId).then((post) => {
            post.voters.set(userId, -1);
            return post;
        });
    }
}
