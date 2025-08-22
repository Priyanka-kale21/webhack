# Website Auditor

A comprehensive website auditing platform that evaluates websites for security vulnerabilities, performance bottlenecks, SEO issues, and accessibility compliance.

## Features

- **Security Analysis**: Checks for missing security headers (CSP, HSTS, X-Frame-Options, etc.)
- **SEO Analysis**: Analyzes meta tags, title tags, heading structure, and more
- **Performance Analysis**: Identifies render-blocking scripts, missing lazy loading, and performance issues
- **Accessibility Analysis**: Basic accessibility checks for images, forms, and semantic HTML
- **Multi-page Crawling**: Automatically discovers and analyzes linked pages within the same domain
- **Actionable Reports**: Provides specific recommendations for fixing identified issues

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Chrome browser (optional, for advanced Lighthouse audits)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scanurl
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration (see Configuration section below)

## Configuration

Create a `.env` file in the project root with the following options:

```env
# Server Configuration
PORT=3000

# Advanced Features (optional)
ENABLE_LIGHTHOUSE=false
ENABLE_AXE_ACCESSIBILITY=false

# Crawler Settings
MAX_PAGES=5
CRAWL_TIMEOUT=15000
USER_AGENT=ScanURLBot/1.0

# API Keys (if needed for external services)
# GOOGLE_PAGESPEED_API_KEY=your_key_here
# SECURITY_SCAN_API_KEY=your_key_here
```

## Running the Project

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts during development.

### Production Mode
```bash
npm start
```

### Health Check
Once running, visit `http://localhost:3000/health` to verify the server is working.

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a website URL to audit
3. Set the maximum number of pages to crawl (1-20)
4. Click "Run Audit" to start the analysis
5. Review the comprehensive report with issues and recommendations

## API Endpoints

### POST /api/audit
Submit a website for auditing.

**Request Body:**
```json
{
  "url": "https://example.com",
  "maxPages": 5
}
```

**Response:**
```json
{
  "input": { "url": "https://example.com", "maxPages": 5 },
  "startedAt": "2024-01-01T00:00:00.000Z",
  "finishedAt": "2024-01-01T00:00:05.000Z",
  "summary": {
    "pagesScanned": 3,
    "totalBytes": 150000,
    "averageResponseMs": 1200
  },
  "reports": [...],
  "errors": []
}
```

## Project Structure

```
scanurl/
├── src/
│   ├── server.js                 # Main Express server
│   └── services/
│       ├── crawler.js            # Website crawling logic
│       └── analyzers/
│           ├── seo.js            # SEO analysis
│           ├── security.js       # Security header analysis
│           ├── performance.js    # Performance analysis
│           ├── accessibility.js  # Basic accessibility checks
│           ├── lighthouse.js     # Advanced performance (optional)
│           └── axe.js            # Advanced accessibility (optional)
├── public/
│   ├── index.html               # Frontend interface
│   ├── styles.css               # Styling
│   └── main.js                  # Frontend logic
├── package.json
├── .env.example
└── README.md
```

## Advanced Features

### Lighthouse Integration
For advanced performance analysis, install additional dependencies:
```bash
npm install lighthouse chrome-launcher
```

Then enable in your `.env`:
```env
ENABLE_LIGHTHOUSE=true
```

### Axe Accessibility
For comprehensive accessibility testing, install:
```bash
npm install axe-core
```

Then enable in your `.env`:
```env
ENABLE_AXE_ACCESSIBILITY=true
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in your `.env` file
2. **Crawling fails**: Check if the target website allows crawling and has proper robots.txt
3. **Lighthouse errors**: Ensure Chrome is installed and accessible
4. **Memory issues**: Reduce MAX_PAGES in your configuration

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=scanurl:*
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Security Note

This tool is designed for legitimate website auditing purposes. Always ensure you have permission to scan websites and respect robots.txt files and rate limiting.
