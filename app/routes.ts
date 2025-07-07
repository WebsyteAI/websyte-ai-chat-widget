import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/features", "routes/features.tsx"),
  route("/pricing", "routes/pricing.tsx"),
  route("/docs", "routes/docs.tsx"),
  route("/blog", "routes/blog.tsx"),
  route("/blog/:slug", "routes/blog.$slug.tsx"),
  route("/contact", "routes/contact.tsx"),
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
  route("/test/iframe", "routes/test.iframe.tsx"),
  route("/script-test", "routes/script-test.tsx"),
  route("/target-test", "routes/target-test.tsx"),
  route("/summary-test", "routes/summary-test.tsx"),
  route("/share/w/:id", "routes/share.w.$id.tsx"),
] satisfies RouteConfig;
