const path = require('path');
const fs = require('fs');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: {
      unpack: '**/*.node',
    },
  },
  hooks: {
    packageAfterCopy: async (forgeConfig, buildPath) => {
      console.log('Building renderer...');
      const { build } = await import('vite');
      await build({
        root: path.join(__dirname, 'src/renderer'),
        base: './',
        plugins: [(await import('@vitejs/plugin-vue')).default()],
        build: {
          outDir: path.join(buildPath, '.vite', 'renderer', 'main_window'),
          emptyOutDir: true,
        },
      });
      console.log('  ✓ Built renderer');

      console.log('Copying node_modules into build...');
      const srcNodeModules = path.join(__dirname, 'node_modules');
      const destNodeModules = path.join(buildPath, 'node_modules');
      fs.cpSync(srcNodeModules, destNodeModules, { recursive: true });
      console.log('  ✓ Copied all node_modules');
    },
  },
  rebuildConfig: {
    force: true,
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'ricardomagid',
          name: 'gacha-manager'
        },
        prerelease: false,
        draft: true,
      }
    }
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'gacha_manager',
        remoteReleases: 'https://github.com/ricardomagid/gacha-manager'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/main/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
