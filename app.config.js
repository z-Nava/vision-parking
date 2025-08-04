import 'dotenv/config';

export default {
  expo: {
    name: "Mi App",
    slug: "mi-app",
    plugins: ["expo-secure-store"],
    version: "1.0.0",
    extra: {
      apiUrl: process.env.API_URL,
      appEnv: process.env.APP_ENV,
    },
  },
};