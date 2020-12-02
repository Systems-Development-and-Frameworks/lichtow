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

            it("throws error when post id invalid", async () => {
                const {
                    errors: [error],
                } = await upvoteAction(123);
                expect(error.message).toEqual("Invalid post");
            });
            it("throws error when user is invalid", async () => {
                userId = "INVALID";
                const {
                    errors: [error],
                } = await upvoteAction(postId);
                expect(error.message).toEqual("Invalid user");
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
    });
});
