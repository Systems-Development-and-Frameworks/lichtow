import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { Neo4JDataSource, User, Post } from "./datasource";

let db;
let jwt;
let userId;
beforeEach(() => {
    db = new Neo4JDataSource();
    userId = null;
    jwt = null;
});

const context = () => {
    return { userId, jwt };
};

const server = new Server({ dataSources: () => ({ db }), context });

const { query, mutate } = createTestClient(server);

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

        beforeEach(async () => {
            await db.createUser("Jonas", "jonas@jonas.com", "Jonas1234");
            await db.createUser("Paula", "paula@paula.com", "Paula1234");
            userId = db.users[0].id;
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
                    users: [
                        { id: db.users[0].id, name: "Jonas", email: "jonas@jonas.com", posts: [] },
                        { id: db.users[1].id, name: "Paula", email: "", posts: [] },
                    ],
                },
            });
        });
        it("only returns email of logged in user", async () => {
            userId = db.users[1].id;
            await expect(userQuery()).resolves.toMatchObject({
                errors: undefined,
                data: {
                    users: [
                        { id: db.users[0].id, name: "Jonas", email: "", posts: [] },
                        { id: db.users[1].id, name: "Paula", email: "paula@paula.com", posts: [] },
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
        describe("DELETE_POST", () => {
            const DELETE_POST = gql`
                mutation($id: ID!) {
                    delete(id: $id) {
                        author {
                            name
                            posts {
                                title
                            }
                        }
                    }
                }
            `;
            const deletePostAction = (postId) =>
                mutate({
                    mutation: DELETE_POST,
                    variables: { id: postId },
                });
            it("removes post from user", async () => {
                db.posts = [new Post("Some post", userId)];
                await expect(deletePostAction(db.posts[0].id)).resolves.toMatchObject({
                    errors: undefined,
                    data: {
                        delete: { author: { name: "Jonas", posts: [] } },
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

        it("adds a user to db.users", async () => {
            expect(db.users).toHaveLength(0);
            await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            expect(db.users).toHaveLength(1);
        });
        it("calls db.createUser", async () => {
            db.createUser = jest.fn(() => {});
            await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            expect(db.createUser).toHaveBeenCalledWith("Jonas", "jonas@jonas.com", "Jonas1234");
        });
        it("responds with user id", async () => {
            const { errors, data } = await signupAction("Jonas", "jonas@jonas.com", "Jonas1234");
            const userId = db.users[0].id;
            expect(data).toMatchObject({ signup: userId });
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
            await db.createUser("Jonas", "jonas@jonas.com", "Jonas1234");
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
