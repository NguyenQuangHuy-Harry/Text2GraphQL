import { ApolloServer, gql } from "apollo-server";
import { neo4jDriver } from "@/services/neo4j";
import { AdapterOpenAI } from "@gqlpt/adapter-openai";
import { GQLPTClient } from "gqlpt";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/services/openAI";
import fs from "fs";
import path from "path";

function fetchShopifyGraphQLTypes(filePath: string): string {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    console.log("Successfully fetched Shopify GraphQL types.");
    return fileContent;
  } catch (error) {
    console.error("Error reading Shopify types file:", error);
    return "";
  }
}

async function uploadSchemaToNeo4j() {
  const schemaString = fetchShopifyGraphQLTypes("./app/data/shopify-types.txt");

  const session = neo4jDriver.session();
  const schemaTypes = gql`
    ${schemaString}
  `;

  for (const definition of schemaTypes.definitions) {
    if (definition.kind === "ObjectTypeDefinition") {
      const typeName = definition.name.value;
      const fields = !definition?.fields
        ? []
        : definition.fields.map((field) => field.name.value);

      const embedding = await generateEmbedding(typeName);
      await session.run(
        `CREATE (n:SchemaNode:ObjectType {name: $typeName, embedding: $embedding})`,
        { typeName, embedding: JSON.stringify(embedding) }
      );

      for (const field of fields) {
        const fieldEmbedding = await generateEmbedding(field);
        await session.run(
          `MATCH (t:SchemaNode {name: $typeName})
           CREATE (f:SchemaNode:Field {name: $field, embedding: $fieldEmbedding})
           CREATE (t)-[:HAS_FIELD]->(f)`,
          { typeName, field, fieldEmbedding: JSON.stringify(fieldEmbedding) }
        );
      }
    }
  }
  session.close();
  console.log("Schema successfully uploaded to Neo4j with embeddings.");
}

export async function POST(req: Request) {
  try {
    const { query, apiKey, typeDefs } = await req.json();

    await uploadSchemaToNeo4j();
    return NextResponse.json({ success: true });
  } catch (error) {
    throw error;
  }
}
