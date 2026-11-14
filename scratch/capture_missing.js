import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('video-research/screenshots');

async function run() {
  console.log('🚀 Capturing targeted workflow screenshots: Booking & Voice Assistant...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();

  const takeScreenshot = async (filename, waitMs = 1200) => {
    if (waitMs) await new Promise(r => setTimeout(r, waitMs));
    const filePath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`📸 Saved: ${filename}`);
  };

  try {
    // 1. Capture 06_booking_workflow.png
    console.log('Logging in as Customer (Priya Sharma)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    const customerAutofill = await page.waitForSelector('button ::-p-text(Priya Sharma)', { timeout: 5000 });
    await customerAutofill.click();
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Scroll to cook cards
    await page.evaluate(() => window.scrollBy(0, 420));
    await new Promise(r => setTimeout(r, 1000));

    // Click "Book Cook" button
    const bookCookBtn = await page.waitForSelector('button ::-p-text(Book Cook)', { timeout: 5000 });
    if (bookCookBtn) {
      await bookCookBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      // Scroll the modal container slightly down to reveal the booking inputs and cost calculations
      await page.evaluate(() => {
        const modal = document.querySelector('.overflow-y-auto');
        if (modal) modal.scrollBy(0, 300);
      });
      await takeScreenshot('06_booking_workflow.png', 1500);
    }

    // 2. Capture Voice Assistant on Landing Page
    console.log('Navigating to Landing Page to capture Vani Voice Assistant...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll down to Vani Voice section
    await page.evaluate(() => window.scrollBy(0, 2400));
    await new Promise(r => setTimeout(r, 1000));

    // Click "Meet Vani Voice"
    const meetVaniBtn = await page.waitForSelector('button ::-p-text(Meet Vani Voice)', { timeout: 5000 });
    if (meetVaniBtn) {
      await meetVaniBtn.click();
      await takeScreenshot('09_voice_assistant_modal.png', 1500);

      // Select Hindi pill
      console.log('Switching language to Hindi and sending query...');
      const hindiPill = await page.$('button ::-p-text(हिन्दी (Hindi))');
      if (hindiPill) await hindiPill.click();

      // Type voice query
      const input = await page.waitForSelector('input[placeholder*="Speak naturally"]', { timeout: 5000 });
      if (input) {
        await input.type('Mujhe Sunita Devi ko dinner ke liye book karna hai');
        const sendBtn = await page.waitForSelector('form button[type="submit"]', { timeout: 5000 });
        if (sendBtn) {
          await sendBtn.click();
          await takeScreenshot('10_voice_interaction_flow.png', 2500);
        }
      }
    }

    console.log('🎉 Missing screenshots captured successfully!');
  } catch (err) {
    console.error('Error during missing screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();

