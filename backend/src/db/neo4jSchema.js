import { gql } from "apollo-server";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import neo4j from "neo4j-driver";

export const driver = neo4j.driver(
    "neo4j://localhost:7687",
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const typeDefs = gql`
    type Post {
        id: ID!
        title: String!
        votes: Int!
        author: User! @relation(name: "WROTE", direction: "IN")
    }

    type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post] @relation(name: "WROTE", direction: "OUT")
    }
`;

const schema = makeAugmentedSchema({ typeDefs });
export default schema;
