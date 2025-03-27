import { AdapterOpenAI } from "@gqlpt/adapter-openai";
import { GQLPTClient } from "gqlpt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, apiKey, typeDefs } = await req.json();

    const adapter = new AdapterOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const client = new GQLPTClient({
      adapter,
      typeDefs,
    });
    await client.connect();

    const result = await client.generateQueryAndVariables(query);

    return NextResponse.json(result);
  } catch (error) {
    throw error;
  }
}
