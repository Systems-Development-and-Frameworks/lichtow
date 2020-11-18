import  { ApolloServer, gql } from "apollo-server";
import  { createTestClient } from "apollo-server-testing";
import  Server  from "./server";
import  { InMemoryDataSource, Post } from "./datasource";


let db;
beforeEach(() => {
    db = new InMemoryDataSource();
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
                    data: { posts: [{ title: "Some post", id: expect.any(String) }] },
                });
            });
        });
    });
});
