module.exports = {
  stories: ["../components/**/*.stories.@(mdx|js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  core: {
    builder: "webpack5",
  },
};
