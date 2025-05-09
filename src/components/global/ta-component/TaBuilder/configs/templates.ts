import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const requireTemplates = require.context('./', true, /Template.ts$/);

const templates: Record<string, TaTemplateFormItem> = {};

requireTemplates.keys().forEach(fileName => {
  const componentConfig = requireTemplates(fileName);
  templates[fileName.replace('.ts', '').replace('./', '')] = componentConfig.default;
});

export default templates;
