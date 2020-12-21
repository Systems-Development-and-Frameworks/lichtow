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
                .writeTransaction((tx) => {
                    tx.run(
                        "MATCH (u:User {id:$userId}) CREATE (u)-[:WROTE]->(p:Post {id: $id, title: $title }) RETURN p {.*}",
                        {
                            ...post,
                            userId: context.userId,
                        }
                    );
                })
                .catch((err) => console.log(err))
                .finally(() => session.close());

            const posts = await delegateToSchema({
                schema: subschema,
                operation: "query",
                fieldName: "Post",
                context,
                info,
            });
            return posts.find((p) => p.id === post.id);
        },
        upvote: async (_, args, { dataSources, userId }) => {
            const postId = args.id;
            const user = await dataSources.db.getUser(userId);
            if (!user) {
                throw new UserInputError("Invalid user", { invalidArgs: userId });
            }
            const post = await dataSources.db.getPost(postId);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }
            return await dataSources.db.upvotePost(postId, userId);
        },
        downvote: async (_, args, { dataSources, userId }) => {
            const postId = args.id;
            const user = await dataSources.db.getUser(userId);
            if (!user) {
                throw new UserInputError("Invalid user", { invalidArgs: userId });
            }
            const post = await dataSources.db.getPost(postId);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }
            return await dataSources.db.downvotePost(postId, userId);
        },

        delete: async (_, args, { dataSources, userId }) => {
            const postId = args.id;
            const user = await dataSources.db.getUser(userId);
            if (!user) {
                throw new UserInputError("Invalid user", { invalidArgs: userId });
            }
            const post = await dataSources.db.getPost(postId);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: postId });
            }
            if (post.authorId !== userId) {
                throw new UserInputError("Only authors are allowed to delete posts");
            }
            return await dataSources.db.deletePost(postId);
        },
    },
    Post: {
        // author: async (obj, args, { dataSources }) => {
        //     return await dataSources.db.getUser(obj.authorId);
        // },
        votes: async (obj, args, context) => {
            let values = Array.from(obj.voters.values());
            let votes = values.reduce((sum, number) => sum + number, 0);
            return votes;
        },
    },
    User: {
        // posts: async (obj, args, { dataSources }) => {
        //     const allPosts = await dataSources.db.allPosts();
        //     return allPosts.filter((post) => post.authorId === obj.id);
        // },
        email: (obj, args, { userId }) => {
            return obj.id === userId ? obj.email : "";
        },
    },
});

export default resolvers;
