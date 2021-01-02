import { gql } from "apollo-server";

const typeDefs = gql`
    type Post {
        id: ID!
        title: String!
        votes: Int!
        author: User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post]
    }

    type Query {
        posts: [Post]
        users: [User]
    }

    type Mutation {
        write(post: PostInput!): Post
        delete(id: ID!): Post
        upvote(id: ID!): Post
        downvote(id: ID!): Post

        login(email: String!, password: String!): String
        signup(name: String!, email: String!, password: String!): String
    }

    input PostInput {
        title: String!
    }
`;

export default typeDefs;
