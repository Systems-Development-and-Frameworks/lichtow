import { UserInputError } from "apollo-server";
import bcrypt from "bcrypt";
import { delegateToSchema } from "@graphql-tools/delegate";
import User from "./user";
import Post from "./post";

const resolvers = ({ subschema }) => ({
    Query: {
        users: (_, __, context, info) =>
            delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "User",
                context,
                info,
            }),
        posts: (_, __, context, info) =>
            delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "Post",
                context,
                info,
            }),
    },
    Mutation: {
        signup: async (_, args, { driver }) => {
            const name = args.name;
            const email = args.email;
            const password = args.password;
            if (password.length < 8) {
                throw new UserInputError("Password is too short", { invalidArgs: password });
            }
            const session = driver.session();
            const { records: userRecords } = await session.readTransaction((tx) =>
                tx
                    .run("MATCH (u:User) WHERE u.email = $email RETURN u", { email: email })
                    .catch((err) => console.log(err))
            );
            if (userRecords.length > 0) {
                throw new UserInputError("User with this email already exists", { invalidArgs: email });
            }
            const newUser = await User.build(name, email, password);
            await session
                .writeTransaction((tx) =>
                    tx.run(
                        "CREATE (u:User {name: $name, email: $email, id: $id, password: $password}) RETURN u",
                        newUser
                    )
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());
            return newUser.id;
        },
        login: async (_, args, { jwt, driver }) => {
            const email = args.email;
            const password = args.password;

            const session = driver.session();
            const { records: userRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.email = $email RETURN u", { email: email }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (userRecords.length === 0) {
                throw new UserInputError("No user with this email", { invalidArgs: email });
            }
            const user = userRecords[0]._fields[0].properties;
            const isCorrectPassword = await bcrypt.compare(password, user.password);
            if (!isCorrectPassword) {
                throw new UserInputError("Password is incorrect");
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            return token;
        },
        write: async (_, args, context, info) => {
            const title = args.post.title;
            const post = new Post(title);

            return delegateToSchema({
                schema: subschema,
                operation: "mutation",
                fieldName: "writePost",
                args: { ...post, userId: context.userId },
                context,
                info,
            });
        },
        upvote: async (_, args, context, info) => {
            const postId = args.id;
            const session = context.driver.session();

            const { records: postRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (p:Post) WHERE p.id = $id RETURN p", { id: postId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (postRecords.length === 0) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }

            return delegateToSchema({
                schema: subschema,
                operation: "mutation",
                fieldName: "votePost",
                args: { value: 1, postId, userId: context.userId },
                context,
                info,
            });
        },
        downvote: async (_, args, context, info) => {
            const postId = args.id;
            const session = context.driver.session();

            const { records: postRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (p:Post) WHERE p.id = $id RETURN p", { id: postId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (postRecords.length === 0) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }

            return delegateToSchema({
                schema: subschema,
                operation: "mutation",
                fieldName: "votePost",
                args: { value: -1, postId, userId: context.userId },
                context,
                info,
            });
        },

        delete: async (_, args, context, info) => {
            const postId = args.id;

            let session = context.driver.session();
            const { records: postRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (p:Post) WHERE p.id = $id RETURN p", { id: postId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (postRecords.length === 0) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }
            session = context.driver.session();
            const { records: authorRecords } = await session
                .readTransaction((tx) =>
                    tx.run("MATCH (u:User)-[:WROTE]->(p:Post {id: $id}) RETURN u ", { id: postId })
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (authorRecords[0]._fields[0].properties.id !== context.userId) {
                throw new UserInputError("Only authors are allowed to delete posts");
            }

            return delegateToSchema({
                schema: subschema,
                operation: "mutation",
                fieldName: "DeletePost",
                args: { id: postId },
                context,
                info,
            });
        },
    },
});

export default resolvers;
