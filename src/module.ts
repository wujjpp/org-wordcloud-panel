import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { WordCloudPanel } from './components/WordCloudPanel';

export const plugin = new PanelPlugin<SimpleOptions>(WordCloudPanel).setPanelOptions((builder) => {
  return builder.addFieldNamePicker({
    path: 'extendedFieldName',
    name: 'Extended',
    description: 'Extended Field'
  })
});
