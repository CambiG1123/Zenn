const express = require("express");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;
puppeteer.use(stealthPlugin());
const { executablePath } = require("puppeteer");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

app.post("/api/search", async (req, res) => {
  try {
    const address = await req.body.input;
    console.log("Address:", address);
    const rentEstimate = await zillow(address);
    console.log("Rent estimate:", rentEstimate);
    res.status(200);
    res.send(JSON.stringify({rentEstimate}));
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).json({ error: "Error during scraping" });
  }
});

// Define the URL to scrape
const url1 = "https://www.zillow.com/";
const url2 = "https://www.realtor.com/";

const zillow = async (address) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  const url1 = 'https://www.zillow.com'; // Replace with the actual Zillow URL
  await page.goto(url1);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  console.log("address", address);
  await page.type("input", address); // Adjust selector based on actual input field
  console.log("Searching for address...");
  
  const [response] = await Promise.all([
    page.waitForNavigation(),
    page.keyboard.press("Enter"),
  ]);

  const zillowEstimate = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      ".Text-c11n-8-99-3__sc-aiai24-0.dFhjAe"
    );

    if (elements.length >= 2) {
      const secondElement = elements[1];
      return secondElement.firstChild.textContent.trim();
    } else {
      return "Second occurrence not found";
    }
  });

  console.log("Zillow's rent estimate is ", zillowEstimate);

  const realtorEstimate = await realtor(address, browser);

  await browser.close();
  return { zillowEstimate, realtorEstimate };
};

const realtor = async (address, browser) => {
  const page = await browser.newPage();
  const url2 = 'https://www.realtor.com'; // Replace with the actual Realtor URL
  await page.goto(url2);
  
  await page.type("input", address); // Adjust selector based on actual input field
  await page.keyboard.press("Enter");

  await page.waitForNavigation(); // Ensure the page has loaded

  const realtorEstimate = await page.evaluate(() => {
    const selector = '[data-testid="rental-headline-text"]';
    const element = document.querySelector(selector);
    return element ? element.textContent.trim() : "Estimate not found";
  });

  return realtorEstimate;
};