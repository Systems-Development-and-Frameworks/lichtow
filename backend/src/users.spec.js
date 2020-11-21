import { ApolloServer, gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { InMemoryDataSource, Post } from "./datasource";

let db;
beforeEach(() => {
    db = new InMemoryDataSource();
});

const server = new Server({ dataSources: () => ({ db }) });

const { query, mutate } = createTestClient(server);

describe("queries", () => {
    describe("USERS", () => {
        const USERS = gql`
            query {
                users {
                    name
                }
            }
        `;

        it("given users in the database", async () => {
            await expect(query({ query: USERS })).resolves.toMatchObject({
                errors: undefined,
                data: { users: [{ name: "Jonas" }, { name: "Paula" }] },
            });
        });
    });

    describe("USERS", () => {
        const USERS = gql`
            query {
                users {
                    name
                    posts {
                        title
                    }
                }
            }
        `;

        it("returns all users with no posts", async () => {
            await expect(query({ query: USERS })).resolves.toMatchObject({
                errors: undefined,
                data: {
                    users: [
                        { name: "Jonas", posts: [] },
                        { name: "Paula", posts: [] },
                    ],
                },
            });
        });
        describe("WRITE_POST", () => {
            const action = () =>
                mutate({
                    mutation: WRITE_POST,
                    variables: { post: { title: "Some post", author: { name: "Jonas" } } },
                });
            const WRITE_POST = gql`
                mutation($post: PostInput!) {
                    write(post: $post) {
                        author {
                            name
                            posts {
                                title
                            }
                        }
                    }
                }
            `;
            it("adds post to user", async () => {
                await expect(action()).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        write: { author: { name: "Jonas", posts: [{ title: "Some post" }] } },
                    },
                });
            });
        });
    });
});
