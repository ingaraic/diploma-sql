// postcss.config.js
const prefixer = require('postcss-prefix-selector');

module.exports = {
  plugins: [
    // Prefix Project A selectors with `.projectA`
    prefixer({
      prefix: '.projectA',
      includeFiles: [/src\/brez_ai2\/styles\/timeline\.css$/],
      transform(prefix, selector, prefixedSelector, filePath) {
        // Don't prefix at-rules or global roots
        if (
          selector.startsWith(':root') ||
          selector.startsWith('html') ||
          selector.startsWith('body') ||
          selector.startsWith('@')
        ) return selector;
        // Already namespaced? leave it
        if (selector.startsWith('.projectA')) return selector;
        return `${prefix} ${selector}`;
      },
    }),

    // Prefix Project B selectors with `.projectB`
    prefixer({
      prefix: '.projectB',
      includeFiles: [/src\/ai\/ai-styles\/timeline\.css$/],
      transform(prefix, selector) {
        if (
          selector.startsWith(':root') ||
          selector.startsWith('html') ||
          selector.startsWith('body') ||
          selector.startsWith('@')
        ) return selector;
        if (selector.startsWith('.projectB')) return selector;
        return `${prefix} ${selector}`;
      },
    }),
  ],
};
