# StepThree Gallery Scraper

Professional-grade Chrome extension for scraping image galleries with smart pattern recognition and automated batch processing.

## ✨ Status: Production Ready

The extension is clean, organized, and ready for use. All core features are working and MV3 compliant.

📚 **Documentation:**
- [START_HERE.md](START_HERE.md) - Quick overview and setup
- [DEVELOPER_QUICKSTART.md](DEVELOPER_QUICKSTART.md) - Quick reference for developers
- [SOURCE_CODE_GUIDE.md](SOURCE_CODE_GUIDE.md) - Complete source code documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design

## Features

- 🎯 **Smart Pattern Recognition** - Automatically detects image galleries on web pages
- 🚀 **Batch Processing** - Efficiently downloads multiple images with configurable concurrency
- 📊 **Advanced Export** - Multiple formats: CSV, Excel, JSON, HTML
- 🎨 **Enhanced CSS Selectors** - AI-powered selector generation with confidence scoring
- ⚡ **Performance Optimized** - Configurable retry logic and download management
- 📈 **Real-time Monitoring** - Live statistics and activity tracking

**Note:** ZIP export functionality has been removed to improve memory management and code stability.

## Quick Start

### Install the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this repository directory
5. Extension is ready to use!

### Use the Extension
1. Navigate to any webpage with images
2. Click the extension icon to open the side panel
3. Choose scan mode:
   - **Quick Scan** - Automatic gallery detection
   - **Table Detection** - Find images in tables
   - **Smart Detection** - AI-powered pattern recognition
   - **Manual Selector** - Visual element picker
4. Export results to CSV, Excel, JSON, or HTML

## Development Server

Optional: Test UI components in browser (non-extension mode)

```bash
npm start    # Start development server on port 3000
```

## Project Structure

```
├── manifest.json        # Extension configuration
├── background.js        # Service worker (~25KB)
├── content.js           # Content script (~524KB, bundled)
├── ui/                  # User interface components
│   └── sidepanel-new.html   # Main side panel UI
├── lib/                 # Third-party libraries
│   ├── dom-cache.js
│   ├── advanced-collector-system.js
│   ├── enhanced-css-selector.js
│   └── (other libraries)
├── src/                 # Source code (for reference/development)
│   ├── background/      # Service worker sources
│   ├── content/         # Content script sources
│   └── lib/             # Shared libraries
└── icons/               # Extension icons
```

See [SOURCE_CODE_GUIDE.md](SOURCE_CODE_GUIDE.md) for detailed code documentation.

## Technology Stack

- **Chrome Extension API:** Manifest V3
- **Frontend:** Vanilla JavaScript
- **Libraries:** XLSX, Papa Parse, noUiSlider, Vue.js
- **Development Server:** Express.js (optional)

## Chrome Extension

The project is a Manifest V3 Chrome extension with the following capabilities:

### Core Features
- Gallery detection and image extraction
- Smart pattern recognition with confidence scoring
- Automated batch downloading
- Multiple export formats
- Advanced CSS selector generation
- Real-time performance monitoring

### Chrome APIs Used
- `chrome.runtime` - Background service communication
- `chrome.storage` - Settings persistence
- `chrome.tabs` - Tab management
- `chrome.downloads` - Download management
- `chrome.scripting` - Content script injection
- `chrome.sidePanel` - Side panel UI

### Security
- Content Security Policy (CSP) compliant
- Manifest V3 architecture
- Input sanitization
- Secure sandbox operations

## Development vs Production

### Development Mode
- Uses Express server with Chrome API mocks
- Enables testing in browser without Chrome extension
- Automatically injects mock APIs into HTML pages
- Cache-control headers prevent stale content

### Production Mode
- Runs natively as Chrome extension
- Uses real Chrome APIs
- Minified and optimized build
- Console statements stripped

## License

MIT
