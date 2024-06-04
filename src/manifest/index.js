/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
const pkg = require('../../package.json');
const csp = require('../../csp');

console.log('csp', csp);
const manifestInput = {
  manifest_version: 3,
  name: 'Pay with BitPay',
  version: pkg.version,

  icons: {
    '16': 'assets/icons/favicon-16.png',
    '32': 'assets/icons/favicon-32.png',
    '48': 'assets/icons/favicon-48.png',
    '128': 'assets/icons/favicon-128.png'
  },

  description: 'Spend crypto instantly',
  homepage_url: 'https://github.com/bitpay/bitpay-browser-extension',
  short_name: 'Pay with BitPay',

  permissions: ['activeTab', 'storage'],
  host_permissions: ['http://*/*', 'https://*/*'],
  // content_security_policy: csp.cspString,

  content_security_policy: {
    extension_pages: csp.cspString
  },

  '__chrome|firefox__author': 'bitpay',
  __opera__developer: {
    name: 'bitpay'
  },

  __firefox__applications: {
    gecko: {
      id: '{854FB1AD-CC3B-4856-B6A0-7786F8CA9D17}'
    }
  },

  __chrome__minimum_chrome_version: '49',
  __opera__minimum_opera_version: '36',

  // browser_action: {
  //   default_icon: {
  //     '16': 'assets/icons/favicon-16.png',
  //     '32': 'assets/icons/favicon-32.png',
  //     '48': 'assets/icons/favicon-48.png',
  //     '128': 'assets/icons/favicon-128.png'
  //   },
  //   default_title: 'Pay with BitPay',
  //   '__chrome|opera__chrome_style': false,
  //   __firefox__browser_style: false
  // },

  action: {
    default_icon: {
      '16': 'assets/icons/favicon-16.png',
      '32': 'assets/icons/favicon-32.png',
      '48': 'assets/icons/favicon-48.png',
      '128': 'assets/icons/favicon-128.png'
    },
    default_title: 'Pay with BitPay',
    default_popup: 'popup.html',
    '__chrome|opera__chrome_style': false,
    __firefox__browser_style: false
  },

  // '__chrome|opera__options_page': 'options.html',

  // options_ui: {
  //   page: 'options.html',
  //   open_in_tab: true,
  //   __chrome__chrome_style: false
  // },

  // background: {
  //   scripts: ['js/background.bundle.js'],
  //   '__chrome|opera__persistent': false
  // },

  background: {
    service_worker: 'js/background.bundle.js',
    type: 'module'
  },

  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['js/contentScript.bundle.js']
    }
  ],

  // web_accessible_resources: ['popup.html']\
  web_accessible_resources: [
    {
      resources: ['popup.html'],
      matches: ['*://*/*']
    }
  ]
};

module.exports = manifestInput;
