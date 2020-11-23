import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { InMemoryDataSource, User, Post } from "./datasource";
import { isTypeSystemDefinitionNode } from "graphql";

let db;
beforeEach(() => {
    db = new InMemoryDataSource();
    db.users.push(new User("Jonas"));
});

const server = new Server({ dataSources: () => ({ db }) });

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
        it("returns empty array", async () => {
            await expect(query({ query: POSTS })).resolves.toMatchObject({
                errors: undefined,
                data: { posts: [] },
            });
        });

        describe("given posts in the database", () => {
            beforeEach(() => {
                db.posts = [new Post({ title: "Some post", authorName: "Jonas" })];
            });

            it("returns posts", async () => {
                await expect(query({ query: POSTS })).resolves.toMatchObject({
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
                    }
                }
            }
        `;
        const action = () =>
            mutate({ mutation: WRITE_POST, variables: { post: { title: "Some post", author: { name: "Jonas" } } } });
        const invalidUser = () =>
            mutate({ mutation: WRITE_POST, variables: { post: { title: "Some post", author: { name: "INVALID" } } } });

        it("throws error when user is invalid", async () => {
            const {
                errors: [error],
            } = await invalidUser();
            expect(error.message).toEqual("Invalid user");
        });

        it("adds a post to db.posts", async () => {
            expect(db.posts).toHaveLength(0);
            await action();
            expect(db.posts).toHaveLength(1);
        });

        it("calls db.createPost", async () => {
            db.createPost = jest.fn(() => {});
            await action();
            expect(db.createPost).toHaveBeenCalledWith({ title: "Some post", authorName: "Jonas" });
        });

        it("responds with created post", async () => {
            await expect(action()).resolves.toMatchObject({
                errors: undefined,
                data: { write: { title: "Some post", id: expect.any(String), votes: 0, author: { name: "Jonas" } } },
            });
        });
    });
    describe("VOTE_POST", () => {
        let postId;
        beforeEach(() => {
            db.posts = [new Post({ title: "Some post", authorName: "Jonas" })];
            postId = db.posts[0].id;
        });
        describe("UPVOTE_POST", () => {
            const UPVOTE_POST = gql`
                mutation($id: ID!, $voter: UserInput!) {
                    upvote(id: $id, voter: $voter) {
                        title
                        id
                        author {
                            name
                        }
                        votes
                    }
                }
            `;
            const upvote = () => {
                mutate({
                    mutation: UPVOTE_POST,
                    variables: { id: postId, voter: { name: "Jonas" } },
                });
            };

            it("calls db.upvotePost", async () => {
                db.upvotePost = jest.fn(() => {});
                await upvote();
                expect(db.upvotePost).toHaveBeenCalledWith(postId, "Jonas");
            });

            it("throws error when post id invalid", async () => {
                const invalidId = () => {
                    mutate({ mutation: UPVOTE_POST, variables: { id: 123, voter: { name: "Jonas" } } });
                };
                const {
                    errors: [error],
                } = await invalidId();
                expect(error.message).toEqual("Invalid post");
            });
            it("throws error when user is invalid", async () => {
                const invalidUser = () => {
                    mutate({
                        mutation: UPVOTE_POST,
                        variables: { id: postId, voter: { name: "INVALID" } },
                    });
                };
                const {
                    errors: [error],
                } = await invalidUser();
                expect(error.message).toEqual("Invalid user");
            });

            it("upvotes post", async () => {
                await expect(upvote()).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        upvote: { title: "Some post", id: postId, votes: 1, author: { name: "Jonas" } },
                    },
                });
            });
            it("does not upvote post again when already upvoted by same user", async () => {
                await upvote();
                await expect(upvote()).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        upvote: { title: "Some post", id: postId, votes: 1, author: { name: "Jonas" } },
                    },
                });
            });
        });
        describe("DOWNVOTE_POST", () => {
            const DOWNVOTE_POST = gql`
                mutation($id: ID!, $voter: UserInput!) {
                    downvote(id: $id, voter: $voter) {
                        title
                        id
                        author {
                            name
                        }
                        votes
                    }
                }
            `;

            it("downvotes post", async () => {
                const downvote = () => {
                    mutate({ mutation: DOWNVOTE_POST, variables: { id: postId, voter: { name: "Jonas" } } });
                };
                await expect(downvote()).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        upvote: { title: "Some post", id: postId, votes: -1, author: { name: "Jonas" } },
                    },
                });
            });
        });
    });
});
