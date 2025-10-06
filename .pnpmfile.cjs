/**
 * Force-add "client-only" for styled-jsx so pnpm places it at:
 * .pnpm/styled-jsx@.../node_modules/client-only
 */
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'styled-jsx') {
        pkg.dependencies = pkg.dependencies || {};
        // keep the range loose; tiny package with no runtime
        if (!pkg.dependencies['client-only']) {
          pkg.dependencies['client-only'] = '^0.0.1';
        }
      }
      return pkg;
    }
  }
};
