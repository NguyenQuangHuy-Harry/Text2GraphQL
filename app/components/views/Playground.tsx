"use client";
import { parse, print } from "graphql";
import * as prettier from "prettier/standalone";
import { useCallback, useEffect, useState } from "react";
import * as defaultValues from "@/data/types";
import { CodeBlock } from "../utils/CodeBlock";
import { Container } from "../utils/Container";
import { Spinner } from "../utils/Spinner";
// Import the shopify-types.json file
import shopifyTypes from "@/data/shopify-types.json";

interface TYPE {
  kind: string;
  name: string;
  ofType: any;
}
// Define GraphQLType interface to match the structure in the JSON file
interface GraphQLType {
  kind: string;
  name: string;
  fields?: Array<{
    name: string;
    type: any;
  }>;

  enumValues?: {
    name: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: null | string;
  }[];

  inputFields?: {
    name: string;
    description: string;
    type: TYPE;
    defaultValue: null;
  }[];

  possibleTypes?: TYPE[];
}

const a = new Set();
export function Playground() {
  const [apiKey, setApiKey] = useState<string>("");

  const [query, setQuery] = useState<string>(defaultValues.query);

  const [generatedQuery, setGeneratedQuery] = useState<string>("");
  const [generatedVariables, setGeneratedVariables] = useState<
    Record<string, unknown>
  >(JSON.parse("{}"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [generatedTypes, setGeneratedTypes] = useState<string>("");

  useEffect(() => {
    function generateTypeScriptTypes(graphQLTypes: GraphQLType[]): string {
      let types = "";

      graphQLTypes.forEach((type) => {
        if (type.kind === "SCALAR") {
          types += `scalar ${type.name}\n`;
        } else if (type.kind === "OBJECT") {
          types += `type ${type.name} {\n`;
          type.fields?.forEach((field) => {
            types += `  ${field.name}: ${generateFieldType(field.type, field.name)}\n`;
          });
          types += "}\n";
        } else if (type.kind === "ENUM") {
          types += `enum ${type.name} {\n`;
          type.enumValues?.forEach((enumValue) => {
            types += `  ${enumValue.name}\n`;
          });
          types += "}\n";
        } else if (type.kind === "INPUT_OBJECT") {
          types += `input ${type.name} {\n`;
          type.inputFields?.forEach((field) => {
            types += `  ${field.name}: ${generateFieldType(field.type, field.name)}\n`;
          });
          types += "}\n";
        } else if (type.kind === "UNION") {
          types += `union ${type.name} = `;
          types += type.possibleTypes
            ?.map((possibleType) => possibleType.name)
            .join(" | ");
          types += "\n";
        } else if (type.kind === "INTERFACE") {
          types += `interface ${type.name} {\n`;
          type.fields?.forEach((field) => {
            types += `  ${field.name}: ${generateFieldType(field.type, field.name)}\n`;
          });
          types += "}\n";
        }
      });

      return types;
    }

    function generateFieldType(fieldType: any, name: any): string {
      if (!fieldType) return name;
      const a: any = {
        SCALAR: fieldType.name,
        LIST: `[${generateFieldType(fieldType.ofType, fieldType.name)}]`,
        OBJECT: fieldType.name,
        NON_NULL: `${generateFieldType(fieldType.ofType, fieldType.name)}!`,
        ENUM: fieldType.name,
        INPUT_OBJECT: fieldType.name,
        INTERFACE: fieldType.name,
        UNION: fieldType.name,
      };

      return a[fieldType.kind] || "any";
    }

    // Use the imported shopify-types.json instead of response.data.__schema.types
    const types = generateTypeScriptTypes(shopifyTypes as GraphQLType[]);
    console.log(types); // Output all types as TypeScript code
    setGeneratedTypes(types); // Store the generated types in state if you want to display them
  }, []);

  const generate = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          typeDefs: print(parse(generatedTypes)),
          query,
          apiKey,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      setGeneratedVariables(data.variables);

      const formattedQuery = await prettier.format(data.query, {
        parser: "graphql",
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        plugins: [require("prettier/parser-graphql")],
        printWidth: 20,
      });

      setGeneratedQuery(formattedQuery);
    } catch (error) {
      const e = error as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, generatedTypes, query]);

  return (
    <div className="bg-graphiql-medium py-10">
      <Container>
        <div className=" mx-auto flex flex-col gap-10">
          <div className="flex w-full gap-10 font-bold">
            <div className="flex flex-col gap-3 w-1/3">
              <p className="text-lg">OpenAPI Key:</p>
              <input
                className="rounded w-full bg-graphiql-light p-3 text-graphiql-dark font-bold"
                id="apikey"
                type="password"
                placeholder="API KEY"
                disabled={loading}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <p className="text-lg">Your Question:</p>
              <div className="flex gap-10">
                <input
                  className="rounded w-full bg-graphiql-light p-3 text-graphiql-dark font-bold"
                  id="apikey"
                  type="text"
                  disabled={loading}
                  placeholder="Query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  readOnly={loading}
                />

                <button
                  onClick={generate}
                  disabled={loading}
                  type="submit"
                  className="rounded text-black font-bold bg-graphiql-dark hover:bg-graphiql-light hover:text-graphiql-dark px-3"
                >
                  {!loading && "Generate"}
                  {loading && (
                    <div className="px-5">
                      <Spinner />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="flex flex-col justify-center align-center">
              {error && (
                <div className="flex flex-col gap-5 bg-graphiql-dark rounded-xl p-10">
                  <p className="text-2xl">Something went wrong :/</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-10 w-full">
            <div className="bg-graphiql-dark rounded-xl w-5/6">
              <div className="flex flex-col">
                <CodeBlock
                  title="query.graphql"
                  code={generatedQuery}
                  language="graphql"
                />
                <CodeBlock
                  title="variables.json"
                  code={JSON.stringify(generatedVariables, null, 2)}
                  language="json"
                />
              </div>
            </div>
          </div>
          {/* Optionally display the generated TypeScript types */}
          {generatedTypes && (
            <div className="bg-graphiql-dark rounded-xl w-full">
              <CodeBlock
                title="generated-types.ts"
                code={generatedTypes}
                language="typescript"
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
