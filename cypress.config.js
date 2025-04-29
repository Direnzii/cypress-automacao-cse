const { defineConfig } = require("cypress");

module.exports = defineConfig({
    chromeWebSecurity: false,
    viewportWidth: 1330,
    viewportHeight: 860,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        projectId: "dtu6fd",
    },
    defaultCommandTimeout: 5000,
});
