const { ApolloServer, gql } = require("apollo-server");

const resolvers = {
    Query: {
        posts: (parent, args, context) => context.dataSources.db.allPosts(),
    },
    Mutation: {
        write: (parent, args, context) => context.dataSources.db.createPost(args)
    }
};

export default resolvers;
