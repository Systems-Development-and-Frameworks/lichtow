import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { InMemoryDataSource, User, Post } from "./datasource";

let db;
let userId;
beforeEach(async () => {
    db = new InMemoryDataSource();
    await db.createUser("Jonas", "jonas@jonas.com", "Jonas1234");
    userId = db.users[0].id;
});

const context = () => {
    return { userId };
};

const server = new Server({ dataSources: () => ({ db }), context });

const { query, mutate } = createTestClient(server);

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
            const {
                errors: [error],
            } = await postQuery();
            expect(error.message).toEqual("Not Authorised!");
        });

        it("returns empty array", async () => {
            await expect(postQuery()).resolves.toMatchObject({
                errors: undefined,
                data: { posts: [] },
            });
        });

        describe("given posts in the database", () => {
            it("returns posts", async () => {
                db.posts = [new Post("Some post", userId)];
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
            const {
                errors: [error],
            } = await writePostAction("Some post");
            expect(error.message).toEqual("Invalid user");
        });

        it("throws error when user is not authorised", async () => {
            userId = null;
            const {
                errors: [error],
            } = await writePostAction("Some post");
            expect(error.message).toEqual("Not Authorised!");
        });

        it("adds a post to db.posts", async () => {
            expect(db.posts).toHaveLength(0);
            await writePostAction("Some post");
            expect(db.posts).toHaveLength(1);
        });

        it("calls db.createPost", async () => {
            db.createPost = jest.fn(() => {});
            await writePostAction("Some post");
            expect(db.createPost).toHaveBeenCalledWith("Some post", userId);
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
        beforeEach(() => {
            db.posts = [new Post("Some post", userId)];
            postId = db.posts[0].id;
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

            it("calls db.upvotePost", async () => {
                db.upvotePost = jest.fn(() => {});
                await upvoteAction(postId);
                expect(db.upvotePost).toHaveBeenCalledWith(postId, userId);
            });

            it("throws error when post id is invalid", async () => {
                const {
                    errors: [error],
                } = await upvoteAction("INVALID");
                expect(error.message).toEqual("Invalid post");
            });

            it("throws error when user is invalid", async () => {
                userId = "INVALID";
                const {
                    errors: [error],
                } = await upvoteAction(postId);
                expect(error.message).toEqual("Invalid user");
            });

            it("throws error when user is not authorised", async () => {
                userId = null;
                const {
                    errors: [error],
                } = await upvoteAction(postId);
                expect(error.message).toEqual("Not Authorised!");
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

            it("calls db.downvotePost", async () => {
                db.downvotePost = jest.fn(() => {});
                await downvoteAction(postId);
                expect(db.downvotePost).toHaveBeenCalledWith(postId, userId);
            });

            it("throws error when post id is invalid", async () => {
                const {
                    errors: [error],
                } = await downvoteAction("INVALID");
                expect(error.message).toEqual("Invalid post");
            });

            it("throws error when user is invalid", async () => {
                userId = "INVALID";
                const {
                    errors: [error],
                } = await downvoteAction(postId);
                expect(error.message).toEqual("Invalid user");
            });

            it("throws error when user is not authorised", async () => {
                userId = null;
                const {
                    errors: [error],
                } = await downvoteAction(postId);
                expect(error.message).toEqual("Not Authorised!");
            });

            it("dowvotes post", async () => {
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
});
