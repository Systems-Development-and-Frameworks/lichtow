import { gql } from "apollo-server";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import neo4j from "neo4j-driver";

export const driver = neo4j.driver(
    "neo4j://localhost:7687",
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

const typeDefs = gql`
    type Post {
        id: ID!
        title: String!
        votes: Int! @cypher(statement: "MATCH (:User)-[v:VOTED]->(this) RETURN sum(v.value)")
        author: User! @relation(name: "WROTE", direction: "IN")
    }

    type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post] @relation(name: "WROTE", direction: "OUT")
    }

    type Mutation {
        votePost(value: Int!, userId: ID!, postId: ID!): Post
            @cypher(
                statement: "MATCH (u:User {id:$userId}), (p:Post {id:$postId}) MERGE (u)-[v:VOTED]->(p) ON CREATE SET v.value = $value ON MATCH SET v.value = $value RETURN p"
            )
        writePost(userId: ID!, id: ID!, title: String!): Post
            @cypher(
                statement: "MATCH (u:User {id:$userId}) CREATE (u)-[:WROTE]->(p:Post {id: $id, title: $title }) RETURN p"
            )
    }
`;

const schema = makeAugmentedSchema({ typeDefs });
export default schema;
