const express = require("express");
const {Cluster} = require("puppeteer-cluster");
// import { Cluster } from "puppeteer-cluster";
const vanillaPuppeteer = require("puppeteer");
const { addExtra } = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
var userAgent = require('user-agents');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;
const puppeteer = addExtra(vanillaPuppeteer);
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

const zillow = async (address) => {
  
  const url1 = 'https://www.zillow.com'; // Replace with the actual Zillow URL
  // Launch the browser and open a new blank page
  // const browser = await puppeteer.launch({
  //   headless: true,
  //   executablePath: executablePath(),
  // });
  const cluster = await Cluster.launch({
    puppeteer,
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
    puppeteerOptions: {
      headless: false,
      executablePath: executablePath(),
      
    },
  });
// const userInput = address
const zillowEstimate = await new Promise((resolve, reject) => {
  cluster.queue(async ({ page }) => {
    try {
      await page.goto(url1);
      await page.type("input", address);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      const zillowEstimate = await page.evaluate(() => {
        const elements = document.querySelectorAll(".dFhjAe");
        console.log("elements", elements);
        if (elements.length >= 2) {
          const ninthElement = elements[8];
          return ninthElement.textContent.trim();
        } else {
          return "Second occurrence not found";
        }
      });

      console.log("Zillow's rent estimate is ", zillowEstimate);
      resolve(zillowEstimate);
    } catch (error) {
      reject(error);
    }
  });
});

const realtorEstimate = await new Promise((resolve, reject) => {
  cluster.queue(async ({ page }) => {
    try {
      const url2 = 'https://www.realtor.com'; // Replace with the actual Realtor URL
      await page.goto(url2);
      await page.setViewport({ width: 1080, height: 1024 });
      await page.type("#search-bar", address, {delay: 100});
      await page.keyboard.press("Enter");
      await page.waitForNavigation(); // Ensure the page has loaded
      
      const realtorEstimate = await page.evaluate(() => {
        const selector = '[data-testid="rental-headline-text"]';
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : "Estimate not found";
      });

      console.log("Realtor's rent estimate is ", realtorEstimate);
      resolve(realtorEstimate);
    } catch (error) {
      reject(error);
    }
  });
})
  
  await cluster.idle();
  await cluster.close();
  return {realtorEstimate,zillowEstimate};
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