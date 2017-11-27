import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';
import { setDefaults } from '@storybook/addon-info';

function loadStories() {
  require('../stories');
}

setOptions({
  name: 'React-Regl',
  downPanelInRight: true,
  showSearchBox: false,
});

setDefaults({
  header:false,
  inline:false,
  source:true,
});

configure(loadStories, module);
