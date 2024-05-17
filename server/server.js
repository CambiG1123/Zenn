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
const url1 = "https://www.zillow.com/";
const zillow = async (address) => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(url1);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  console.log("address", address);
  await page.type("input", address);
  console.log("Searching for address...");
  
  const [response] = await Promise.all([
    // page.waitForSelector("[type=submit]"),
    page.waitForNavigation(),
    page.keyboard.press("Enter"),
    // page.click("[type=submit]"),
  ]);
  // await page.waitForSelector('h1');

  const rentEstimate = await page.evaluate(() => {
    const elements = document.querySelectorAll(
      ".Text-c11n-8-99-3__sc-aiai24-0.dFhjAe"
    );

    // Check if there is at least a second occurrence
    if (elements.length >= 2) {
      // Access the second element and extract its text content
      const secondElement = elements[1]; // Index 1 for the second occurrence
      return secondElement.firstChild.textContent.trim();
    } else {
      return "Second occurrence not found";
    }
  });
 
  console.log("Zillow's rent estimate is ", rentEstimate);
  await browser.close();
  return rentEstimate;

};
