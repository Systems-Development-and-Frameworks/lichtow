import { UserInputError } from "apollo-server";
import bcrypt from "bcrypt";

const resolvers = {
    Query: {
        users: (parent, args, context) => context.dataSources.db.allUsers(),
        posts: (parent, args, context) => context.dataSources.db.allPosts(),
    },
    Mutation: {
        signup: async (_, args, { dataSources }) => {
            const name = args.name;
            const email = args.email;
            const password = args.password;
            if (password.length < 9) {
                throw new UserInputError("Password is too short", { invalidArgs: password });
            }
            const users = await dataSources.db.allUsers();
            if (users.find((user) => user.email === email)) {
                throw new UserInputError("User with this email already exists", { invalidArgs: email });
            }
            const newUser = await dataSources.db.createUser(name, email, password);
            return newUser.id;
        },
        login: async (_, args, { dataSources, jwt }) => {
            const email = args.email;
            const password = args.password;
            const user = await dataSources.db.getUserByEmail(email);
            if (!user) {
                throw new UserInputError("No user with this email", { invalidArgs: email });
            }
            const isCorrectPassword = await bcrypt.compare(password, user.password);
            if (!isCorrectPassword) {
                throw new UserInputError("Password is incorrect");
            }
            let token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
            return token;
        },
        write: async (_, args, { dataSources, userId }) => {
            const title = args.post.title;
            const user = await dataSources.db.getUser(userId);
            if (!user) {
                throw new UserInputError("Invalid user", { invalidArgs: userId });
            }
            return await dataSources.db.createPost(title, userId);
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

        // delete: async (parent, args, context) => {
        //     const id = args.id;
        //     const post = await context.dataSources.db.getPost(id);
        //     if (!post) {
        //         throw new UserInputError("Invalid post", { invalidArgs: id });
        //     }
        //     return await context.dataSources.db.deletePost(id);
        // },

        // downvote: async (parent, args, context) => {
        //     const name = args.voter.name;
        //     const id = args.id;
        //     const downvoter = await context.dataSources.db.getUser(name);
        //     if (!downvoter) {
        //         throw new UserInputError("Invalid user", { invalidArgs: name });
        //     }
        //     const post = await context.dataSources.db.getPost(id);
        //     if (!post) {
        //         throw new UserInputError("Invalid post", { invalidArgs: id });
        //     }
        //     return await context.dataSources.db.downvotePost(id, name);
        // },
    },
    Post: {
        author: async (obj, args, context) => {
            return await context.dataSources.db.getUser(obj.authorId);
        },
        votes: async (obj, args, context) => {
            let values = Array.from(obj.voters.values());
            let votes = values.reduce((sum, number) => sum + number, 0);
            return votes;
        },
    },
    User: {
        posts: async (obj, args, context) => {
            const allPosts = await context.dataSources.db.allPosts();
            return allPosts.filter((post) => post.authorId === obj.name);
        },
    },
};

export default resolvers;
