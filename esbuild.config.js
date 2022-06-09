/* eslint-disable import/no-extraneous-dependencies */
const esbuild = require('esbuild');

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const apiEndpoints = ['authors', 'content', 'menus', 'settings', 'tags'];

esbuild.build({
  entryPoints: apiEndpoints.flatMap((endpoint) => {
    return [
      `./lib/api/${endpoint}/delete/main.ts`,
      `./lib/api/${endpoint}/get/main.ts`,
      `./lib/api/${endpoint}/list/main.ts`,
      `./lib/api/${endpoint}/post/main.ts`,
      `./lib/api/${endpoint}/put/main.ts`,
    ];
  }),
  outdir: './dist',
  bundle: true,
  minify: false, // TODO: Should probably minify at some point.
  platform: 'node',
  format: 'cjs',
  legalComments: 'none',
  target: 'node16',
  external: ['aws-sdk'],
  plugins: [
    nodeExternalsPlugin({
      dependencies: false,
    }),
  ],
}).catch((error) => {
  console.error(error);
  // eslint-disable-next-line no-magic-numbers
  process.exit(1);
});
