import { driver } from "./neo4jSchema";

(async () => {
    const session = driver.session();
    await session.writeTransaction((tx) => tx.run("MATCH(n) DETACH DELETE n;"));
    driver.close();
})();
