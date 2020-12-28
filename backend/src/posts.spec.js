import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import User from "./user";
import Post from "./post";
import { driver } from "./db/neo4jSchema";

let jwt;
let userId;
let query;
let mutate;

const cleanDatabase = async () => {
    await driver.session().writeTransaction((tx) => tx.run("MATCH(n) DETACH DELETE n"));
};

beforeEach(async () => {
    await cleanDatabase();
    userId = null;
    jwt = null;
    const server = new Server({ context });
    const testClient = createTestClient(server);
    ({ query, mutate } = testClient);
    userId = await createUser("Jonas", "jonas@jonas.com", "Jonas1234");
});

afterAll(async () => {
    await cleanDatabase();
    driver.close();
});

const context = () => {
    return { userId, jwt, driver };
};

const createUser = async (name, email, password) => {
    const newUser = await User.build(name, email, password);
    await driver
        .session()
        .writeTransaction((tx) =>
            tx.run("CREATE (u:User {name: $name, email: $email, id: $id, password: $password}) RETURN u", newUser)
        );
    return newUser.id;
};

const createPost = async (title, userId) => {
    const newPost = new Post(title);
    await driver.session().writeTransaction((tx) =>
        tx.run("MATCH (u:User {id:$userId}) CREATE (u)-[:WROTE]->(p:Post {id: $id, title: $title }) RETURN p", {
            userId,
            ...newPost,
        })
    );
    return newPost.id;
};

describe("queries", () => {
    describe("POSTS", () => {
        const POSTS = gql`
            query {
                posts {
                    id
                    title
                    votes
                    author {
                        name
                    }
                }
            }
        `;

        let postQuery = () => query({ query: POSTS });

        it("throws error when user is not authorised", async () => {
            userId = null;
            await expect(postQuery()).resolves.toMatchObject({
                data: {
                    posts: null,
                },
                errors: [expect.objectContaining({ message: "Not Authorised!" })],
            });
        });

        it("returns empty array", async () => {
            await expect(postQuery()).resolves.toMatchObject({
                errors: undefined,
                data: { posts: [] },
            });
        });

        describe("given posts in the database", () => {
            it("returns posts", async () => {
                await createPost("Some post", userId);
                await expect(postQuery()).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        posts: [{ id: expect.any(String), title: "Some post", votes: 0, author: { name: "Jonas" } }],
                    },
                });
            });
        });
    });
});

describe("mutations", () => {
    describe("WRITE_POST", () => {
        const WRITE_POST = gql`
            mutation($post: PostInput!) {
                write(post: $post) {
                    id
                    title
                    votes
                    author {
                        name
                        id
                    }
                }
            }
        `;
        const writePostAction = (title) => mutate({ mutation: WRITE_POST, variables: { post: { title: title } } });

        it("throws error when user is invalid", async () => {
            userId = "INVALID";
            await expect(writePostAction("Some post")).resolves.toMatchObject({
                data: {
                    write: null,
                },
                errors: [expect.objectContaining({ message: "Invalid user" })],
            });
        });

        it("throws error when user is not authorised", async () => {
            userId = null;
            await expect(writePostAction("Some post")).resolves.toMatchObject({
                data: {
                    write: null,
                },
                errors: [expect.objectContaining({ message: "Not Authorised!" })],
            });
        });

        it("adds a post to database", async () => {
            let { records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p"));
            expect(records).toHaveLength(0);
            await writePostAction("Some post");
            ({ records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p")));
            expect(records).toHaveLength(1);
        });

        it("responds with created post", async () => {
            await expect(writePostAction("Some post")).resolves.toMatchObject({
                errors: undefined,
                data: {
                    write: {
                        title: "Some post",
                        id: expect.any(String),
                        votes: 0,
                        author: { name: "Jonas", id: userId },
                    },
                },
            });
        });
    });
    describe("VOTE_POST", () => {
        let postId;
        beforeEach(async () => {
            postId = await createPost("Some post", userId);
        });
        describe("UPVOTE_POST", () => {
            const UPVOTE_POST = gql`
                mutation($id: ID!) {
                    upvote(id: $id) {
                        title
                        id
                        author {
                            name
                        }
                        votes
                    }
                }
            `;
            const upvoteAction = (id) => mutate({ mutation: UPVOTE_POST, variables: { id: id } });

            it("throws error when post id is invalid", async () => {
                await expect(upvoteAction("INVALID")).resolves.toMatchObject({
                    data: {
                        upvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Invalid post" })],
                });
            });

            it("throws error when user is invalid", async () => {
                userId = "INVALID";
                await expect(upvoteAction(postId)).resolves.toMatchObject({
                    data: {
                        upvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Invalid user" })],
                });
            });

            it("throws error when user is not authorised", async () => {
                userId = null;
                await expect(upvoteAction(postId)).resolves.toMatchObject({
                    data: {
                        upvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Not Authorised!" })],
                });
            });

            it("upvotes post", async () => {
                await expect(upvoteAction(postId)).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        upvote: { title: "Some post", id: postId, votes: 1, author: { name: "Jonas" } },
                    },
                });
            });

            it("does not upvote post again when already upvoted by same user", async () => {
                await upvoteAction(postId);
                await expect(upvoteAction(postId)).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        upvote: { title: "Some post", id: postId, votes: 1, author: { name: "Jonas" } },
                    },
                });
            });
        });
        describe("DOWNVOTE_POST", () => {
            const DOWNVOTE_POST = gql`
                mutation($id: ID!) {
                    downvote(id: $id) {
                        title
                        id
                        author {
                            name
                        }
                        votes
                    }
                }
            `;
            const downvoteAction = (id) => mutate({ mutation: DOWNVOTE_POST, variables: { id: id } });

            it("throws error when post id is invalid", async () => {
                await expect(downvoteAction("INVALID")).resolves.toMatchObject({
                    data: {
                        downvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Invalid post" })],
                });
            });

            it("throws error when user is invalid", async () => {
                userId = "INVALID";
                await expect(downvoteAction(postId)).resolves.toMatchObject({
                    data: {
                        downvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Invalid user" })],
                });
            });

            it("throws error when user is not authorised", async () => {
                userId = null;
                await expect(downvoteAction(postId)).resolves.toMatchObject({
                    data: {
                        downvote: null,
                    },
                    errors: [expect.objectContaining({ message: "Not Authorised!" })],
                });
            });

            it("downvotes post", async () => {
                await expect(downvoteAction(postId)).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        downvote: { title: "Some post", id: postId, votes: -1, author: { name: "Jonas" } },
                    },
                });
            });

            it("does not downvote post again when already downvoted by same user", async () => {
                await downvoteAction(postId);
                await expect(downvoteAction(postId)).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        downvote: { title: "Some post", id: postId, votes: -1, author: { name: "Jonas" } },
                    },
                });
            });
        });
    });
    describe("DELETE_POST", () => {
        let postId;
        let otherUserId;
        let otherPostId;
        beforeEach(async () => {
            otherUserId = await createUser("Paula", "paula@paula.com", "Paula1234");
            postId = await createPost("Some post", userId);
            otherPostId = await createPost("Some other post", otherUserId);
        });
        const DELETE_POST = gql`
            mutation($id: ID!) {
                delete(id: $id) {
                    title
                    id
                    author {
                        name
                    }
                    votes
                }
            }
        `;
        const deletePostAction = (id) => mutate({ mutation: DELETE_POST, variables: { id: id } });

        it("throws error when post id invalid", async () => {
            await expect(deletePostAction("INVALID")).resolves.toMatchObject({
                data: {
                    delete: null,
                },
                errors: [expect.objectContaining({ message: "Invalid post" })],
            });
        });

        it("throws error if user is not the author of the post", async () => {
            await expect(deletePostAction(otherPostId)).resolves.toMatchObject({
                data: {
                    delete: null,
                },
                errors: [expect.objectContaining({ message: "Only authors are allowed to delete posts" })],
            });
        });

        it("removes a post from database", async () => {
            let { records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p"));
            expect(records).toHaveLength(2);
            await deletePostAction(postId);
            ({ records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p")));
            expect(records).toHaveLength(1);
        });

        it("does not remove same post twice from database", async () => {
            let { records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p"));
            expect(records).toHaveLength(2);
            await deletePostAction(postId);
            await deletePostAction(postId);
            ({ records } = await driver.session().readTransaction((tx) => tx.run("MATCH (p:Post) RETURN p")));
            expect(records).toHaveLength(1);
        });

        it("returns post that is deleted", async () => {
            await expect(deletePostAction(postId)).resolves.toMatchObject({
                errors: undefined,
                data: {
                    delete: { title: "Some post", id: postId, votes: 0, author: { name: "Jonas" } },
                },
            });
        });
    });
});
