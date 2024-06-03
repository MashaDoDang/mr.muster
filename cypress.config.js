const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) { },
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.js',
  },
})
