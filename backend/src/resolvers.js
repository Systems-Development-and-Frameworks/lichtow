const { ApolloServer, gql } = require("apollo-server");

const resolvers = {
    Query: {
        users: (parent, args, context) => context.dataSources.db.allUsers(),
        posts: (parent, args, context) => context.dataSources.db.allPosts()
    },
    Mutation: {
        write: (parent, args, context) => {
            const newPost =  {
                title: args.post.title,
                authorName: args.post.author.name
            }
            return context.dataSources.db.createPost(newPost);
        }
    }
};

export default resolvers;
