import { driver } from "./neo4jSchema";
import User from "../user";
import Post from "../post";

const seed = async () => {
    const session = driver.session();
    //Users
    const jonas = await User.build("Jonas", "jonas@jonas.com", "Jonas1234");
    await session.writeTransaction((tx) =>
        tx.run("CREATE (a:User {name: $name, email: $email, id: $id, password: $password})", jonas)
    );
    const paula = await User.build("Paula", "paula@paula.com", "Paula1234");
    await session.writeTransaction((tx) =>
        tx.run("CREATE (a:User {name: $name, email: $email, id: $id, password: $password})", paula)
    );

    //Posts and Authors
    const posts = [
        new Post("Jonas likes writing posts"),
        new Post("Cool post"),
        new Post("Awesome Post"),
        new Post("Yet another post"),
    ];
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}) CREATE (u)-[:WROTE]->(a:Post {title: $title, id: $id})", {
            ...posts[0],
            userId: jonas.id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}) CREATE (u)-[:WROTE]->(a:Post {title: $title, id: $id})", {
            ...posts[1],
            userId: jonas.id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}) CREATE (u)-[:WROTE]->(a:Post {title: $title, id: $id})", {
            ...posts[2],
            userId: paula.id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}) CREATE (u)-[:WROTE]->(a:Post {title: $title, id: $id})", {
            ...posts[3],
            userId: paula.id,
        })
    );

    //Votes
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: 1,
            userId: paula.id,
            postId: posts[0].id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: -1,
            userId: paula.id,
            postId: posts[1].id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: 1,
            userId: paula.id,
            postId: posts[2].id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: 1,
            userId: jonas.id,
            postId: posts[0].id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: -1,
            userId: jonas.id,
            postId: posts[2].id,
        })
    );
    await session.writeTransaction((tx) =>
        tx.run("MATCH (u: User {id: $userId}), (p: Post {id: $postId}) CREATE (u)-[:VOTED {value: $value}]->(p)", {
            value: 1,
            userId: jonas.id,
            postId: posts[3].id,
        })
    );
};

(async () => {
    await seed();
    driver.close();
})();
