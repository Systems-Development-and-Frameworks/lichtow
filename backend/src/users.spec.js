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
            //TODO: use .toHaveBeenCalledWith -> Password hashing in User Class
            expect(db.createUser).toHaveBeenCalled();
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
});
