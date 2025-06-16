import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/test", "routes/test.tsx"),
  route("/script-test", "routes/script-test.tsx"),
  route("/target-test", "routes/target-test.tsx"),
  route("/summary-test", "routes/summary-test.tsx"),
  route("/admin/cache/test", "routes/admin.cache.test.tsx"),
  route("/admin/cache", "routes/admin.cache._index.tsx"),
  route("/admin/cache/:url", "routes/admin.cache.$url.tsx"),
] satisfies RouteConfig;
