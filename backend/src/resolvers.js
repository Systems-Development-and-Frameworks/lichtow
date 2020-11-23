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
                author: args.post.author.name,
            };
            const author = await context.dataSources.db.getUser(newPost.author);
            if (!author) {
                throw new UserInputError("Invalid user", { invalidArgs: newPost.author });
            }
            return await context.dataSources.db.createPost(newPost);
        },
    },
    Post: {
        async author(obj, args, context) {
            return await context.dataSources.db.getUser(obj.author);
        },
    },
    User: {
        async posts(obj, args, context) {
            const allPosts = await context.dataSources.db.allPosts();
            return allPosts.filter((post) => post.author === obj.name);
        },
    },
};

export default resolvers;
