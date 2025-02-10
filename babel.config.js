module.exports = {
    presets: [
      [
        '@nuxt/babel-preset-app',
        {
          useBuiltIns: 'usage', // Usar polyfills automáticamente según el uso
          corejs: 3, // Especificar la versión de core-js
        },
      ],
    ],
  };