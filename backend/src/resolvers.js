import { UserInputError } from "apollo-server";
import bcrypt from "bcrypt";
import { delegateToSchema } from "@graphql-tools/delegate";
import User from "./user";
import Post from "./post";

const resolvers = ({ subschema }) => ({
    Query: {
        users: (_, args, context, info) =>
            delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "User",
                context,
                info,
            }),
        posts: (_, args, context, info) =>
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
                    .run("MATCH (n:User) WHERE n.email = $email RETURN n", { email: email })
                    .catch((err) => console.log(err))
            );
            if (userRecords.length > 0) {
                throw new UserInputError("User with this email already exists", { invalidArgs: email });
            }
            const newUser = await User.build(name, email, password);
            await session
                .writeTransaction((tx) =>
                    tx.run(
                        "CREATE (a:User {name: $name, email: $email, id: $id, password: $password}) RETURN a",
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
                .readTransaction((tx) => tx.run("MATCH (n:User) WHERE n.email = $email RETURN n", { email: email }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (userRecords.length === 0) {
                throw new UserInputError("No user with this email", { invalidArgs: email });
            }
            const user = userRecords[0]._fields[0].properties; //TODO: check if there is a better way to access the node
            const isCorrectPassword = await bcrypt.compare(password, user.password);
            if (!isCorrectPassword) {
                throw new UserInputError("Password is incorrect");
            }
            let token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            return token;
        },
        write: async (_, args, context, info) => {
            const title = args.post.title;

            let session = context.driver.session();
            const { records: userRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.id = $id RETURN u", { id: context.userId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());

            if (userRecords.length === 0) {
                throw new UserInputError("Invalid user", { invalidArgs: context.userId });
            }
            let post = new Post(title);
            session = context.driver.session();
            await session
                .writeTransaction((tx) =>
                    tx.run(
                        "MATCH (u:User {id:$userId}) CREATE (u)-[:WROTE]->(p:Post {id: $id, title: $title, votes: $votes })",
                        {
                            ...post,
                            userId: context.userId,
                        }
                    )
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());

            //TODO: find a better way to return a post because if id is not in the query the post
            //will not be matched
            const posts = await delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "Post",
                context,
                info,
            });
            return posts.find((p) => p.id === post.id);
        },
        upvote: async (_, args, context, info) => {
            const postId = args.id;
            let session = context.driver.session();
            const { records: userRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.id = $id RETURN u", { id: context.userId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (userRecords.length === 0) {
                throw new UserInputError("Invalid user", { invalidArgs: context.userId });
            }
            session = context.driver.session();
            const { records: postRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (p:Post) WHERE p.id = $id RETURN p", { id: postId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (postRecords.length === 0) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }

            session = context.driver.session();
            await session
                .writeTransaction((tx) =>
                    tx.run(
                        "MATCH (u:User {id:$userId}), (p:Post {id:$postId}) MERGE (u)-[r:VOTED]->(p) ON CREATE SET r.value = $value ON MATCH SET r.value = $value",
                        {
                            postId,
                            value: 1,
                            userId: context.userId,
                        }
                    )
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());

            //TODO
            const posts = await delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "Post",
                context,
                info,
            });
            return posts.find((p) => p.id === postId);
        },
        downvote: async (_, args, context, info) => {
            const postId = args.id;
            let session = context.driver.session();
            const { records: userRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.id = $id RETURN u", { id: context.userId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (userRecords.length === 0) {
                throw new UserInputError("Invalid user", { invalidArgs: context.userId });
            }
            session = context.driver.session();
            const { records: postRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (p:Post) WHERE p.id = $id RETURN p", { id: postId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (postRecords.length === 0) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }

            session = context.driver.session();
            await session
                .writeTransaction((tx) =>
                    tx.run(
                        "MATCH (u:User {id:$userId}), (p:Post {id:$postId}) MERGE (u)-[r:VOTED]->(p) ON CREATE SET r.value = $value ON MATCH SET r.value = $value",
                        {
                            postId,
                            value: -1,
                            userId: context.userId,
                        }
                    )
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());

            //TODO
            const posts = await delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "Post",
                context,
                info,
            });
            return posts.find((p) => p.id === postId);
        },

        delete: async (_, args, context, info) => {
            const postId = args.id;

            let session = context.driver.session();
            const { records: userRecords } = await session
                .readTransaction((tx) => tx.run("MATCH (u:User) WHERE u.id = $id RETURN u", { id: context.userId }))
                .catch((err) => console.log(err))
                .finally(() => session.close());
            if (userRecords.length === 0) {
                throw new UserInputError("Invalid user", { invalidArgs: context.userId });
            }
            session = context.driver.session();
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
    Post: {
        votes: async (obj, _, context) => {
            const session = context.driver.session();
            const { records: voteRecords } = await session
                .readTransaction((tx) =>
                    tx.run("MATCH (u)-[r:VOTED]->(p:Post {id:$postId}) RETURN r.value", {
                        postId: obj.id,
                    })
                )
                .catch((err) => console.log(err))
                .finally(() => session.close());
            let votes = 0;
            voteRecords.forEach((voteRecord) => {
                votes += voteRecord._fields[0];
            });
            return votes;
        },
    },
    User: {
        email: (obj, _, { userId }) => {
            return obj.id === userId ? obj.email : "";
        },
    },
});

export default resolvers;
