import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('video-research/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Puppeteer browser automation for VaniCook screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    }
  });

  const page = await browser.newPage();

  const takeScreenshot = async (filename, waitMs = 1000) => {
    if (waitMs) await new Promise(r => setTimeout(r, waitMs));
    const filePath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`📸 Saved: ${filename}`);
  };

  try {
    // 1. Landing Page
    console.log('Navigating to Landing Page...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await takeScreenshot('01_landing_page.png', 1500);

    // Scroll down to showcase features & social impact section
    await page.evaluate(() => window.scrollBy(0, 950));
    await takeScreenshot('01b_landing_features.png', 1000);

    // 2. Login Page
    console.log('Navigating to Login Page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await takeScreenshot('02_login_screen.png', 1000);

    // 3. Customer Dashboard
    console.log('Logging in as Customer (Priya Sharma)...');
    // Click autofill button for Customer
    const customerAutofill = await page.waitForSelector('button ::-p-text(Priya Sharma)', { timeout: 5000 });
    if (customerAutofill) {
      await customerAutofill.click();
    } else {
      await page.type('input[type="email"]', 'priya.sharma@example.com');
      await page.type('input[type="password"]', 'Customer#123');
    }
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot('03_customer_dashboard.png', 2000);

    // 4. Cook Discovery & Search
    console.log('Capturing Cook Discovery...');
    // Scroll slightly down to focus on Cook Cards and filter pills
    await page.evaluate(() => window.scrollBy(0, 420));
    await takeScreenshot('04_cook_discovery_and_search.png', 1000);

    // 5. Cook Profile Detail Modal
    console.log('Opening Cook Profile Detail Modal...');
    // Look for "View Profile" or cook card
    const profileBtn = await page.$('button ::-p-text(View Profile)') || await page.$('button ::-p-text(Book Cook)') || await page.$('button[data-testid="view-cook"]');
    if (profileBtn) {
      await profileBtn.click();
      await takeScreenshot('05_cook_profile_detail.png', 1200);

      // 6. Direct Booking Workflow Modal
      console.log('Checking Booking Flow...');
      const bookDirectBtn = await page.$('button ::-p-text(Book Dedicated Cook)') || await page.$('button ::-p-text(Proceed to Book)');
      if (bookDirectBtn) {
        await bookDirectBtn.click();
        await takeScreenshot('06_booking_workflow.png', 1200);
      }

      // Close modal
      const closeBtn = await page.$('button[aria-label="Close"]') || await page.$('button ::-p-text(Cancel)') || await page.$('button ::-p-text(✕)');
      if (closeBtn) await closeBtn.click();
    }

    // 7. Neighbourhood Pools Marketplace
    console.log('Navigating to Neighbourhood Pools...');
    await page.goto('http://localhost:5173/customer/pools', { waitUntil: 'networkidle2' });
    await takeScreenshot('07_neighbourhood_pools_market.png', 2000);

    // 8. Pool Details & Cost Sharing Calculator
    console.log('Capturing Pool Detail / Savings view...');
    const poolCardBtn = await page.$('button ::-p-text(View Details)') || await page.$('button ::-p-text(Join Pool)') || await page.$('button ::-p-text(Cost Breakdown)');
    if (poolCardBtn) {
      await poolCardBtn.click();
      await takeScreenshot('08_pool_details_cost_sharing.png', 1500);
      const closePoolModal = await page.$('button[aria-label="Close"]') || await page.$('button ::-p-text(Cancel)');
      if (closePoolModal) await closePoolModal.click();
    } else {
      // Scroll down to showcase cost breakdown
      await page.evaluate(() => window.scrollBy(0, 350));
      await takeScreenshot('08_pool_details_cost_sharing.png', 1000);
    }

    // 9. Voice Assistant Modal (Vani AI)
    console.log('Opening Vani Voice Assistant Modal...');
    const voiceTrigger = await page.$('button[aria-label="Open Voice Assistant"]') || 
                         await page.$('button[title*="Voice"]') || 
                         await page.$('button ::-p-text(Vani Voice)') || 
                         await page.$('button ::-p-text(Talk to Vani)') ||
                         await page.$('.fixed.bottom-6.right-6 button') ||
                         await page.$('button[data-testid="voice-assistant-fab"]');
    if (voiceTrigger) {
      await voiceTrigger.click();
      await takeScreenshot('09_voice_assistant_modal.png', 1500);

      // 10. Voice Interaction Flow (Type a query in Hindi/English)
      console.log('Simulating Voice/Text Command Interaction...');
      const voiceInput = await page.$('input[placeholder*="Type a command"]') || await page.$('input[placeholder*="Vani"]') || await page.$('input[type="text"]');
      if (voiceInput) {
        await voiceInput.type('Mujhe Sunita Devi ko dinner ke liye book karna hai');
        const sendBtn = await page.$('button[type="submit"]') || await page.$('button[aria-label="Send"]');
        if (sendBtn) {
          await sendBtn.click();
          await takeScreenshot('10_voice_interaction_flow.png', 2500);
        }
      }

      const closeVoice = await page.$('button[aria-label="Close voice assistant"]') || await page.$('button[aria-label="Close"]');
      if (closeVoice) await closeVoice.click();
    }

    // 11. Customer Bookings List
    console.log('Navigating to Customer Bookings...');
    await page.goto('http://localhost:5173/customer/bookings', { waitUntil: 'networkidle2' });
    await takeScreenshot('11_customer_bookings.png', 1500);

    // 12. Cook Dashboard
    console.log('Logging in as Cook (Sunita Devi)...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    const cookAutofill = await page.waitForSelector('button ::-p-text(Sunita Devi)', { timeout: 5000 });
    if (cookAutofill) {
      await cookAutofill.click();
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await takeScreenshot('12_cook_dashboard.png', 2000);

      // 13. Cook Availability Manager
      console.log('Navigating to Cook Availability Manager...');
      await page.goto('http://localhost:5173/cook/availability', { waitUntil: 'networkidle2' });
      await takeScreenshot('13_cook_availability_schedule.png', 1500);

      // 14. Cook Profile Management
      console.log('Navigating to Cook Profile Edit...');
      await page.goto('http://localhost:5173/cook/profile', { waitUntil: 'networkidle2' });
      await takeScreenshot('14_cook_profile_management.png', 1500);
    }

    // 15. Admin Dashboard
    console.log('Logging in as Administrator...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    const adminAutofill = await page.waitForSelector('button ::-p-text(System Administrator)', { timeout: 5000 });
    if (adminAutofill) {
      await adminAutofill.click();
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await takeScreenshot('15_admin_dashboard.png', 2000);
    }

    console.log('🎉 All application screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();

