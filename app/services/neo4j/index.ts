import neo4j from "neo4j-driver";

const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = process.env;

export const neo4jDriver = neo4j.driver(
  NEO4J_URI || "",
  neo4j.auth.basic(NEO4J_USERNAME || "", NEO4J_PASSWORD || "")
);
