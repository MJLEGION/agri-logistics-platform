const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Disable CSP in development
      mode: env.mode || 'development',
    },
    argv
  );

  // Modify CSP to allow eval in development
  if (config.devServer) {
    config.devServer.headers = {
      ...config.devServer.headers,
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
    };
  }

  return config;
};
