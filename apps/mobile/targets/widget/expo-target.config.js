/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "Widgets",
  displayName: "Tahleel",
  deploymentTarget: "17.0",
  icon: "../../assets/images/icon.png",
  images: {
    fire: "../../assets/images/fire.png",
    "streaks-widget-background":
      "../../assets/images/streaks-widget-background.png",
  },
  entitlements: {},
});
