const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('BROWSER ERROR:', msg.text());
      } else {
        console.log('BROWSER LOG:', msg.text());
      }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', error => {
      console.error('BROWSER PAGE ERROR:', error.message);
    });

    // Capture unhandled rejections
    page.on('requestfailed', request => {
      console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Check if #root is empty
    const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => 'No #root found');
    if (!rootHtml || rootHtml.trim() === '') {
      console.log('Root element is empty - White Screen Confirmed.');
    } else {
      console.log('Root element has content.');
    }

    await browser.close();
  } catch (err) {
    console.error('PUPPETEER SCRIPT ERROR:', err);
  }
})();
