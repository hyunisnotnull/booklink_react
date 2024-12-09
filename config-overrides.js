const path = require('path');

module.exports = {
  webpack: function (config, env) {
    // babel-loader 설정을 찾기
    const babelLoader = config.module.rules.find(
      rule => rule.loader && rule.loader.includes('babel-loader')
    );

    if (babelLoader) {
      // babel-loader의 옵션에 @babel/preset-react 추가
      babelLoader.options.presets = [
        ...babelLoader.options.presets,
        '@babel/preset-react', // JSX 변환을 위한 프리셋 추가
      ];
      babelLoader.options.plugins = [
        ...babelLoader.options.plugins,
        ['transform-remove-console', { exclude: ['error', 'warn'] }],
        // ['transform-remove-console', { exclude: [] }], // 모든 console 메서드 제거
      ];
    } else {
      // 만약 babel-loader를 찾지 못했다면 직접 설정을 추가
      config.module.rules.push({
        test: /\.(js|jsx|mjs|ts|tsx)$/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-react', // JSX 변환을 위한 프리셋 추가
          ],
          plugins: [
            ['transform-remove-console', { exclude: ['error', 'warn'] }],
            // ['transform-remove-console', { exclude: [] }], // 모든 console 메서드 제거
          ],
        },
      });
    }

    return config;
  },
};
