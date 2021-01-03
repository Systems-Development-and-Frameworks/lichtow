import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import User from "./user";
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

describe("queries", () => {
    describe("USERS", () => {
        const USERS = gql`
            query {
                users {
                    id
                    name
                    email
                    posts {
                        title
                    }
                }
            }
        `;

        const userQuery = () => query({ query: USERS });

        let jonasId;
        let paulaId;

        beforeEach(async () => {
            jonasId = await createUser("Jonas", "jonas@jonas.com", "Jonas1234");
            paulaId = await createUser("Paula", "paula@paula.com", "Paula1234");
            userId = jonasId;
        });

        it("throws error when user is not authorised", async () => {
            userId = null;
            await expect(userQuery()).resolves.toMatchObject({
                data: {
                    users: null,
                },
                errors: [expect.objectContaining({ message: "Not Authorised!" })],
            });
        });

        it("returns all users with no posts", async () => {
            await expect(userQuery()).resolves.toMatchObject({
                errors: undefined,
                data: {
                    users: expect.arrayContaining([
                        { id: jonasId, name: "Jonas", email: "jonas@jonas.com", posts: [] },
                        { id: paulaId, name: "Paula", email: "", posts: [] },
                    ]),
                },
            });
        });

        it("only returns email of logged in user", async () => {
            userId = paulaId;
            await expect(userQuery()).resolves.toMatchObject({
                errors: undefined,
                data: {
                    users: [
                        { id: jonasId, name: "Jonas", email: "", posts: [] },
                        { id: paulaId, name: "Paula", email: "paula@paula.com", posts: [] },
                    ],
                },
            });
        });
        describe("WRITE_POST", () => {
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
            const writePostAction = (title) =>
                mutate({
                    mutation: WRITE_POST,
                    variables: { post: { title: title } },
                });

            it("adds post to user", async () => {
                await expect(writePostAction("Some post")).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        write: { author: { name: "Jonas", posts: [{ title: "Some post" }] } },
                    },
                });
            });
        });
    });
});

describe("mutations", () => {
    describe("SIGNUP", () => {
        const SIGNUP = gql`
            mutation($name: String!, $email: String!, $password: String!) {
                signup(name: $name, email: $email, password: $password)
            }
        `;
        const signupAction = (name, email, password) =>
            mutate({ mutation: SIGNUP, variables: { name: name, email: email, password: password } });

        it("throws an error when password is too short", async () => {
            await expect(signupAction("Jonas", "jonas@jonas.com", "short")).resolves.toMatchObject({
                data: {
                    signup: null,
                },
                errors: [expect.objectContaining({ message: "Password is too short" })],
            });
        });

        it("adds a user to database", async () => {
            let { records } = await driver.session().readTransaction((tx) => tx.run("MATCH (u:User) RETURN u"));
            expect(records).toHaveLength(0);
            await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            ({ records } = await driver.session().readTransaction((tx) => tx.run("MATCH (u:User) RETURN u")));
            expect(records).toHaveLength(1);
        });

        it("responds with user id", async () => {
            const { errors, data } = await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            let { records } = await driver
                .session()
                .readTransaction((tx) => tx.run("MATCH (u:User {name: $name}) RETURN u", { name: "Jonas" }));
            expect(data).toMatchObject({ signup: records[0]._fields[0].properties.id });
            expect(errors).toBe(undefined);
        });

        it("throws error if user with email already exists", async () => {
            await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            await expect(signupAction("Jonas", "jonas@jonas.com", "Jonas1234")).resolves.toMatchObject({
                data: {
                    signup: null,
                },
                errors: [expect.objectContaining({ message: "User with this email already exists" })],
            });
        });
    });
    describe("LOGIN", () => {
        const LOGIN = gql`
            mutation($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
        `;

        const loginAction = (email, password) =>
            mutate({ mutation: LOGIN, variables: { email: email, password: password } });

        beforeEach(async () => {
            await createUser("Jonas", "jonas@jonas.com", "Jonas1234");
        });

        it("throws error if there is no user with this email", async () => {
            await expect(loginAction("wrong email", "Jonas1234")).resolves.toMatchObject({
                data: {
                    login: null,
                },
                errors: [expect.objectContaining({ message: "No user with this email" })],
            });
        });

        it("throws error if the password is incorrect", async () => {
            await expect(loginAction("jonas@jonas.com", "wrongPassword")).resolves.toMatchObject({
                data: {
                    login: null,
                },
                errors: [expect.objectContaining({ message: "Password is incorrect" })],
            });
        });

        it("logs user in successfully", async () => {
            jwt = { sign: () => "successToken" };
            const { errors, data } = await loginAction("jonas@jonas.com", "Jonas1234");
            expect(errors).toBe(undefined);
            expect(data).toMatchObject({ login: "successToken" });
        });
    });
});
