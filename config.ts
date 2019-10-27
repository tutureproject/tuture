export default {
  // Path to assets directory.
  assetsPath: 'tuture-assets',

  // Path to build outputs.
  buildPath: 'tuture-build',

  // Port to use for tuture-server.
  port: 3000,

  // Files that should be commited but won't be tracked by Tuture.
  ignoredFiles: [
    // Git-related files
    '.gitignore',
    '.gitattributes',

    // Node.js
    'package-lock.json',
    'yarn.lock',

    // Tuture-related files
    'tuture.yml',
  ],
};
