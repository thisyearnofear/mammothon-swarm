const config = {
  development: {
    apiBaseUrl: "http://localhost:8001/api",
  },
  production: {
    apiBaseUrl: "https://kind-gwenora-papajams-0ddff9e5.koyeb.app/api",
  },
};

const environment =
  window.location.hostname === "localhost" ? "development" : "production";
export const apiBaseUrl = config[environment].apiBaseUrl;
