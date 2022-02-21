/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  /**
   * It's not currently possible to change the `public` folder
   * without breaking the dev server's serving of static assets.
   * Seems to be hard-coded in @remix-run/serve:
   * https://github.com/remix-run/remix/blob/5e16c8255bd0771aaf62b69c1a7ba6a4e773e4df/packages/remix-serve/index.ts#L10
   */
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "server/build",
  devServerPort: 8002,
};
