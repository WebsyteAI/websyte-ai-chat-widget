import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard._index.tsx"),
    route("analytics", "routes/dashboard.analytics.tsx"),
    route("settings", "routes/dashboard.settings.tsx"),
    route("widgets", "routes/dashboard.widgets._index.tsx"),
    route("widgets/new", "routes/dashboard.widgets.new.tsx"),
    route("widgets/:id/edit", "routes/dashboard.widgets.$id.edit.tsx"),
  ]),
  route("/test", "routes/test.tsx"),
  route("/script-test", "routes/script-test.tsx"),
  route("/target-test", "routes/target-test.tsx"),
  route("/summary-test", "routes/summary-test.tsx"),
] satisfies RouteConfig;
