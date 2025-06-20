import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/test", "routes/test.tsx"),
  route("/script-test", "routes/script-test.tsx"),
  route("/target-test", "routes/target-test.tsx"),
  route("/summary-test", "routes/summary-test.tsx"),
] satisfies RouteConfig;
