const { ApolloServer, gql } = require("apollo-server");

const resolvers = {
    Query: {
        posts: (parent, args, context) => context.dataSources.db.allPosts(),
    },
};

export default resolvers;
