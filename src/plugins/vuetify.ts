// plugins/vuetify.js
import { createVuetify } from 'vuetify';
import { icons } from './mdi-icon'; // Import icons from separate file
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { PurpleTheme } from '@/theme/LightTheme';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      ...icons
    },
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'PurpleTheme',
    themes: {
      PurpleTheme
    }
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat'
    },
    VCard: {
      rounded: 'md'
    },
    VTextField: {
      rounded: 'lg',
      color: 'primary',
      variant: 'outlined'
    },
    VTextarea: {
      rounded: 'lg',
      color: 'primary',
      variant: 'outlined',
      bgColor: 'surface',
      autoGrow: true,
      rows: 3,
      counter: true,
      maxlength: 120
    },
    VSelect: {
      rounded: 'lg',
      color: 'primary',
      variant: 'outlined'
    },
    VTooltip: {
      location: 'top'
    }
  }
});