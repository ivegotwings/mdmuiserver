module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // ui-platform app
    {
      name: 'ui-platform',
      script: 'app.js',
      instances: 2,
      watching: true,
      env_development: {
        RUN_OFFLINE: false,
        NODE_CONFIG_DIR: './src/server/config'
      },
      env_production: {
        RUN_OFFLINE: false,
        NODE_CONFIG_DIR: './src/server/config'
      }
    }],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {}
};