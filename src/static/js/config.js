const config = {
  development: {
    apiBaseUrl: "http://localhost:8001/api",
  },
  production: {
    apiBaseUrl: "https://mammothon-api.onrender.com/api", // You'll need to update this with your actual API URL
  },
};

const environment =
  window.location.hostname === "localhost" ? "development" : "production";
export const apiBaseUrl = config[environment].apiBaseUrl;
