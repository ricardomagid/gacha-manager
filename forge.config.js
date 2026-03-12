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

      const { execSync } = require('child_process');
      const destNodeModules = path.join(buildPath, 'node_modules');
      fs.mkdirSync(destNodeModules, { recursive: true });
      fs.copyFileSync(path.join(__dirname, 'package.json'), path.join(buildPath, 'package.json'));
      fs.copyFileSync(path.join(__dirname, 'package-lock.json'), path.join(buildPath, 'package-lock.json'));
      execSync(`npm ci --prefix "${buildPath}" --omit=dev`, {
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log('  ✓ Copied production node_modules');
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
      name: '@electron-addons/electron-forge-maker-nsis',
      config: {},
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
