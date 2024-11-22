````markdown
# SAMBA CRAWLER Browser Extension  

An AI-powered browser extension that seamlessly parses, stores, and structures web content into semantic schemas—ensuring data permanence and empowering users with censorship-free access.

🚀 With SambaNova's lightning-fast inference speeds, AICrawler becomes unstoppable. It doesn’t just scrape web pages—it processes and organizes data 10x faster, enabling near-instant creation of decentralized, reliable backups for everyone.

---

## 🚀 Features  
- **Content Parsing and Semantic Chunking**  
- **Web Page Mutations and Overlays**  
- **Integration with SambaNova AI's lightning-fast inference speeds**
- **Offline save**: then saves the collected data offline and online
- **AI chat for stored data**: user can chat with save data for particular information
- **10x faster data processing**
- **Censorship-free access**
- **Support for Development and Production Environments**  
- **Chrome/Chromium Browser Support**  

---

## 🔧 Prerequisites  
- **Node.js** (latest LTS version recommended)  
- **PNPM Package Manager**  
- **Chrome/Chromium Browser**  

---

## 🛠️ Installation  

### Clone the Repository  
```bash
git clone https://github.com/nwakaku/samba-crawler-crawler.git  
cd samba-crawler-crawler
````

### Install Dependencies

```bash
pnpm install
```

* * *

🖥️ Development
---------------

### Start the Development Server

```bash
pnpm dev
```

This command starts Webpack in watch mode with development configuration:

```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      EXTENSION_ENV: JSON.stringify('development'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'common.js',
          transform: () => '',
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          ecma: 6,
          output: {
            ascii_only: true,
          },
        },
      }),
    ],
  },
});
```

### Load the Extension in Chrome

1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable "Developer mode" in the top right.
3.  Click "Load unpacked."
4.  Select the `apps/crawler-extension/build` directory.

* * *

🌟 Building for Production
--------------------------

### Build the Extension

```bash
cd apps/crawler-extension
```

```bash
pnpm build
```

This creates a production build in the `build` directory and generates a zip file for distribution.

* * *

⚙️ Configuration
----------------

The extension can be configured through the manifest file:

```json
{
  "manifest_version": 3,
  "name": "Mutable Web — Samba Crawler",
  "version": "",
  "version_name": "",
  "description": "",
  "author": "",
  "short_name": "Samba Crawler",
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "exclude_globs": ["https://social.dapplets.org/*"],
      "js": ["contentscript.js"],
      "run_at": "document_idle"
    }
  ],
  "permissions": ["storage", "tabs", "contextMenus"],
  "host_permissions": ["http://*/*", "https://*/*"]
}
```

### Key Configuration Points

*   **Extension Permissions and Host Permissions**
*   **Content Script Matching Patterns**
*   **Background Service Worker Settings**
*   **Web Accessible Resources**

* * *

💾 Storage
----------

The extension uses Chrome's local storage for maintaining state:

```typescript
import browser from 'webextension-polyfill';

export class ExtensionStorage {
  constructor(private _keyPrefix: string) {}

  async getItem(key: string): Promise<string> {
    const globalKey = this._makeKey(key);
    const result = await browser.storage.local.get(globalKey);
    return result[globalKey];
  }

  async setItem(key: string, value: string): Promise<void> {
    await browser.storage.local.set({ [this._makeKey(key)]: value });
  }

  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(this._makeKey(key));
  }

  private _makeKey(key: string): string {
    return `${this._keyPrefix}:${key}`;
  }
}
```

* * *

🧪 Testing
----------

Run the test suite:

```bash
pnpm test
```

The project uses Playwright for testing:

```json
"test": "playwright test",
"release": "semantic-release"
```

* * *

📜 License
----------

MIT License - see the `LICENSE` file for details.

* * *

🤝 Contributing
---------------

1.  Fork the repository.
2.  Create your feature branch:
    
    ```bash
    git checkout -b feature/amazing-feature
    ```
    
3.  Commit your changes:
    
    ```bash
    git commit -m 'Add some amazing feature'
    ```
    
4.  Push to the branch:
    
    ```bash
    git push origin feature/amazing-feature
    ```
    
5.  Open a Pull Request.

* * *

📬 Support
----------

For support, open an issue in the GitHub repository or contact the development team at contact@dapplets.org.

* * *

📚 Related Documentation
------------------------

*   **Chrome Extension Development**
*   **Web Extension API**