import { assertValidExecutionArguments } from "graphql/execution/execute";

const { ApolloServer, gql, UserInputError } = require("apollo-server");

const resolvers = {
    Query: {
        users: (parent, args, context) => context.dataSources.db.allUsers(),
        posts: (parent, args, context) => context.dataSources.db.allPosts(),
    },
    Mutation: {
        async write(parent, args, context) {
            const newPost = {
                title: args.post.title,
                authorName: args.post.author.name,
            };
            const author = await context.dataSources.db.getUser(newPost.authorName);
            if (!author) {
                throw new UserInputError("Invalid user", { invalidArgs: newPost.authorName });
            }
            return await context.dataSources.db.createPost(newPost);
        },
        async upvote(parent, args, context) {
            const upvoter = await context.dataSources.db.getUser(args.voter.name);
            if (!upvoter) {
                throw new UserInputError("Invalid user", { invalidArgs: args.voter.name });
            }
            const post = await context.dataSources.db.getPost(args.id);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: args.id });
            }
            return await context.dataSources.db.upvotePost(args.id, args.voter.name);
        },
        async downvote(parent, args, context) {
            const upvoter = await context.dataSources.db.getUser(args.voter.name);
            if (!upvoter) {
                throw new UserInputError("Invalid user", { invalidArgs: args.voter.name });
            }
            const post = await context.dataSources.db.getPost(args.id);
            if (!post) {
                throw new UserInputError("Invalid post", { invalidArgs: args.id });
            }
            return await context.dataSources.db.downvotePost(args.id, args.voter.name);
        },
    },
    Post: {
        async author(obj, args, context) {
            return await context.dataSources.db.getUser(obj.authorName);
        },
        async votes(obj, args, context) {
            let values = Array.from(obj.voters.values());
            let votes = values.reduce((sum, number) => sum + number, 0);
            return votes;
        },
    },
    User: {
        async posts(obj, args, context) {
            const allPosts = await context.dataSources.db.allPosts();
            return allPosts.filter((post) => post.authorName === obj.name);
        },
    },
};

export default resolvers;
