import { ForbiddenError, UserInputError } from "apollo-server";
import { allow, rule, shield } from "graphql-shield";

const forbidden = rule({ cache: "contextual" })(async () => {
    return new ForbiddenError("Forbidden");
});

const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, context) => {
    if (context.userId !== null) {
        const session = context.driver.session();
        const { records: userRecords } = await session
            .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.id = $id RETURN u", { id: context.userId }))
            .catch((err) => console.log(err))
            .finally(() => session.close());

        if (userRecords.length === 0) {
            return new UserInputError("Invalid user", { invalidArgs: context.userId });
        }
        return true;
    }
    return false;
});

const isEmailOwner = rule({ cahce: "contextual" })(async (parent, args, context) => {
    if (parent.id !== context.userId) {
        parent.email = "";
    }
    return true;
});

export const permissions = shield(
    {
        Query: {
            "*": forbidden,
            posts: isAuthenticated,
            users: isAuthenticated,
        },
        Mutation: {
            "*": forbidden,
            signup: allow,
            login: allow,
            write: isAuthenticated,
            upvote: isAuthenticated,
            downvote: isAuthenticated,
            delete: isAuthenticated,
        },
        User: {
            email: isEmailOwner,
        },
    },
    {
        allowExternalErrors: true,
        fallbackRule: isAuthenticated,
    }
);
