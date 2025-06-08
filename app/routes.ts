import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/test", "routes/test.tsx"),
  route("/script-test", "routes/script-test.tsx"),
  route("/target-test", "routes/target-test.tsx"),
] satisfies RouteConfig;
