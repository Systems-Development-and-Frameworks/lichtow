import { gql } from "apollo-server";
import { createTestClient } from "apollo-server-testing";
import Server from "./server";
import { InMemoryDataSource, User, Post } from "./datasource";

let db;
beforeEach(() => {
    db = new InMemoryDataSource();
});

const server = new Server({ dataSources: () => ({ db }) });

const { query, mutate } = createTestClient(server);

describe("mutations", () => {
    describe("SIGNUP", () => {
        const SIGNUP = gql`
            mutation($name: String!, $email: String!, $password: String!) {
                signup(name: $name, email: $email, password: $password)
            }
        `;
        const signupAction = () =>
            mutate({ mutation: SIGNUP, variables: { name: "Jonas", email: "jonas@jonas.com", password: "Jonas1234" } });
        const signupShortPasswordAction = () =>
            mutate({ mutation: SIGNUP, variables: { name: "Jonas", email: "jonas@jonas.com", password: "short" } });
        it("throws an error when password is too short", async () => {
            const {
                errors: [error],
                data,
            } = await signupShortPasswordAction();
            expect(error.message).toEqual("Password is too short");
            expect(data).toMatchObject({ signup: null });
        });

        it("adds a user to db.users", async () => {
            expect(db.users).toHaveLength(0);
            await signupAction();
            expect(db.users).toHaveLength(1);
        });
        it("calls db.createUser", async () => {
            db.createUser = jest.fn(() => {});
            await signupAction();
            expect(db.createUser).toHaveBeenCalledWith("Jonas", "jonas@jonas.com", "Jonas1234");
        });
        it("responds with user id", async () => {
            const { errors, data } = await signupAction();
            const userId = db.users[0].id;
            expect(data).toMatchObject({ signup: userId });
            expect(errors).toBe(undefined);
        });
        it("throws error if user with email already exists", async () => {
            await signupAction();
            const {
                errors: [error],
                data,
            } = await signupAction();
            expect(error.message).toEqual("User with this email already exists");
            expect(data).toMatchObject({ signup: null });
        });
    });
    describe("LOGIN", () => {
        const LOGIN = gql`
            mutation($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
        `;
        const loginAction = () =>
            mutate({ mutation: LOGIN, variables: { email: "jonas@jonas.com", password: "Jonas1234" } });
        const wrongEmailAction = () =>
            mutate({ mutation: LOGIN, variables: { email: "wrong email", password: "Jonas1234" } });
        const wrongPasswordAction = () =>
            mutate({ mutation: LOGIN, variables: { email: "jonas@jonas.com", password: "wrongPassword" } });

        beforeEach(async () => {
            await db.createUser("Jonas", "jonas@jonas.com", "Jonas1234");
        });
        it("throws error if there is no user with this email", async () => {
            const {
                errors: [error],
                data,
            } = await wrongEmailAction();
            expect(error.message).toEqual("No user with this email");
            expect(data).toMatchObject({ login: null });
        });
        it("throws error if the password is incorrect", async () => {
            const {
                errors: [error],
                data,
            } = await wrongPasswordAction();
            expect(error.message).toEqual("Password is incorrect");
            expect(data).toMatchObject({ login: null });
        });
        //TODO: Test successful login
    });
});
