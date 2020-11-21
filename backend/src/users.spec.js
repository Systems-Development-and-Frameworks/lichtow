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
                    name,
                    posts {
                        title
                    }
                }
            }
        `;

        it("given users in the database with empty posts array", async () => {
            await expect(query({ query: USERS })).resolves.toMatchObject({
                errors: undefined,
                data: { users: [{ name: "Jonas", posts: [] }, { name: "Paula", posts: [] }] },
            });
        });
    });
});