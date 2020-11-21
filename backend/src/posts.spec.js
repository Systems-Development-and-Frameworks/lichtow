import { ApolloServer, gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { InMemoryDataSource, User, Post } from "./datasource";

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
                db.posts = [new Post({ title: "Some post" })];
            });

            it("returns posts", async () => {
                await expect(query({ query: POSTS })).resolves.toMatchObject({
                    errors: undefined,
                    data: { posts: [{ id: expect.any(String), title: "Some post" }] },
                });
            });
        });
    });
});

describe("mutations", () => {
    describe("WRITE_POST", () => {
        const action = () =>
            mutate({ mutation: WRITE_POST, variables: { post: { title: "Some post", author: { name: "Jonas" } } } });
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
});
