import { ForbiddenError } from "apollo-server";
import { allow, rule, shield } from "graphql-shield";

const forbidden = rule({ cache: "contextual" })(async () => {
    return new ForbiddenError("Forbidden");
});

const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, ctx) => {
    return ctx.userId !== null;
});

const isCurrentUser = rule({ cahce: "contextual" })(async (parent, args, context) => {
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
        },
        User: {
            email: isCurrentUser,
        },
    },
    {
        allowExternalErrors: true,
        fallbackRule: isAuthenticated,
    }
);
