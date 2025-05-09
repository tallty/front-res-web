import { App } from 'vue';

const useTaComponentDirectives = (app: App) => {
  const requireComponent = require.context('./', true, /\.ts$/);

  requireComponent.keys().forEach(fileName => {
    if (fileName !== './index.ts') {
      const module = requireComponent(fileName);
      const directiveName = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '');
      app.directive(directiveName, module.default || module);
    }
  });
};

export default useTaComponentDirectives;
