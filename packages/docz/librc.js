const pkg = require('./package.json')

module.exports = {
  external: Object.keys(pkg.dependencies).concat([
    '@mdx-js/tag/dist/mdx-provider',
    '@sindresorhus/slugify',
    '~db',
    '~imports',
    'array-sort',
    'capitalize',
    'create-react-context',
    'lodash/fp',
    'react-imported-component',
    'react-router-dom',
    'react-router-hash-link',
    'react-router',
    'ulid',
  ]),
}
