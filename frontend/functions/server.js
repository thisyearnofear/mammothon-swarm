const path = require("path");
require("module-alias/register");
require("module-alias").addAliases({
  "@": path.join(__dirname, ".."),
  lib: path.join(__dirname, "../src/lib"),
});

const { builder } = require("@netlify/functions");

async function handler(event, context) {
  // Initialize Next.js
  const { default: next } = await import("next");
  const app = next({
    dev: false,
    conf: {
      distDir: ".next",
      webpack: (config) => {
        config.resolve.modules = [
          path.resolve(__dirname, ".."),
          path.resolve(__dirname, "../src"),
          path.resolve(__dirname, "../src/lib"),
          "node_modules",
        ];
        config.resolve.alias = {
          ...config.resolve.alias,
          "@": path.resolve(__dirname, ".."),
          lib: path.resolve(__dirname, "../src/lib"),
        };
        return config;
      },
    },
  });

  await app.prepare();
  const handle = app.getRequestHandler();

  try {
    const {
      path: reqPath,
      httpMethod,
      headers,
      queryStringParameters,
      body,
    } = event;

    const request = new Request(
      `https://${headers.host}${reqPath}${
        queryStringParameters
          ? "?" + new URLSearchParams(queryStringParameters).toString()
          : ""
      }`,
      {
        method: httpMethod,
        headers: new Headers(headers),
        body: body ? body : undefined,
      }
    );

    const response = await handle(request);
    const responseHeaders = Object.fromEntries(response.headers.entries());

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: await response.text(),
    };
  } catch (error) {
    console.error("Error handling request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}

exports.handler = builder(handler);
