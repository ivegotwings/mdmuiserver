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
      instance: 1,
      watching: true,
      env_production: {
        NODE_ENV: 'production',
        'RUN_OFFLINE': false,
        'NODE_CONFIG_DIR': './src/server/config'
      }
    }
  ],
  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
  }
};
