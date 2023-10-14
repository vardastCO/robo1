const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require("dotenv").config()
const { Client } = require('pg');

const pool = new Client({
    user: 'db',
    host: 'postgres', // Use the service name defined in docker-compose.yml
    database: 'mydb', // This should match the POSTGRES_DB in docker-compose.yml
    password: 'root',
    port: 5432,
  });
  
const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
        { id: 'url', title: 'URL' },
        { id: 'price', title: 'Price' },
    ],
});

let browser; 

const proxyServer =
'ss://YWVzLTI1Ni1nY206d0DVaGt6WGpjRA==@38.54.13.15:31214#main';
async function createBrowser() {
    try {
         browser = await puppeteer.launch({
            headless: true, // Set to true for headless mode, false for non-headless
            executablePath: process.env.NODE_ENV === "production" ?
                process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
            args: [
                '--no-sandbox',
                `--proxy-server=${proxyServer}`,
                '--disable-setuid-sandbox',
                '--enable-logging',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-dev-shm-usage',
            ],
        });
        return browser;
    } catch (error) {
        // console.error('Error creating the browser:', error);
        throw error;
    }
}



const initialPage = 'https://www.hypersaz.com/';
const startUrlPattern = 'https://www.hypersaz.com/product.php?';

async function main() {
     
    if(await browser){
        await pool.connect();
     
        async function processPage(pageUrl) {
            console.log('start',pageUrl)
            try {
                const page = await browser.newPage();
                await page.goto(pageUrl, { timeout: 300000  });
                const priceElement = await page.$x(
                    '/html/body/section[2]/div/div/div[3]/div/ul/li[2]/p/span'
                );
                const nameElement = await page.$x(
                    '/html/body/section[2]/div/div/div[2]/div/div[1]/div/div[1]/h1'
                );
                if (priceElement.length > 0) {
                    const priceText = await page.evaluate(
                        (el) => el.textContent,
                        priceElement[0]
                    );
                    const nameText = await page.evaluate(
                        (el) => el.textContent,
                        nameElement[0]
                    );
                    console.log('NAME :::',nameText.trim())
                    console.log('price :::',priceText.trim())
                    if (priceText.trim() !== '' && nameText.trim() !== '') {
                      
                        await pool.query('INSERT INTO scraped_data(name, url, price) VALUES($1, $2, $3)', [nameText.trim(), pageUrl, priceText.trim()]);
                        // console.log(`Saved: URL: ${pageUrl}, Price: ${priceText.trim()}`);
                    }
                }
                const hrefs = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a'));
                    return links.map((link) => link.getAttribute('href'));
                });
        
                for (const href of hrefs) {
                    try{
                        if (!href.startsWith('https://')) {
                            var outputUrl = initialPage + href;
                        } else {
                            var outputUrl = href;
                        }
                        if (outputUrl.startsWith(startUrlPattern)) {
                            const result = await pool.query('SELECT * FROM unvisited WHERE url = $1', [outputUrl]);
                
                            if (result.rows.length === 0) {
                                // URL doesn't exist, so you can insert it
                                await pool.query('INSERT INTO unvisited(url) VALUES($1)', [outputUrl]);
                            }
                        }
                    } catch (error) {
                    }
                }
                await page.close();
            } catch (error) {
                // console.error('An error occurred while navigating to the page farbooood:', error);
            }      
        
        }
        while (true) {
            try {
                let currentHref = await pool.query('SELECT url FROM unvisited LIMIT 1');
 
                let visitedCount = 0;

                if (currentHref.rows.length > 0) {
                    const visitedCheckResult = await pool.query('SELECT COUNT(*) FROM visited WHERE url = $1', [currentHref.rows[0].url]);
                    visitedCount = visitedCheckResult.rows[0].count;
                    currentHref = currentHref.rows[0].url;
                } else {
                    // await pool.query('DELETE FROM unvisited WHERE url = $1', [currentHref]);
                    currentHref = initialPage;
                    // break
                }
                // Check if the URL already exists in the "visited" table
               
                if (visitedCount == 0) {
                  await pool.query('DELETE FROM unvisited WHERE url = $1', [currentHref]);
                  await pool.query('INSERT INTO visited(url) VALUES($1)', [currentHref]);
                  const pageForEvaluation = await browser.newPage();
              
                  let retryCount = 0;
                  const maxRetries = 10000; // Define the maximum number of retries
              
                  while (retryCount < maxRetries) {
                    try {
                      await processPage(currentHref); // Increase the timeout to 30 seconds
                      break; // If successful, break out of the loop
                    } catch (error) {
                      if (error.name === 'TimeoutError') {
                        // console.error(
                        //   `Timeout occurred (Retry ${retryCount + 1}/${maxRetries}). Retrying...`
                        // );
                        retryCount++;
                      } else {
                        // throw error; // Rethrow other errors
                      }
                    }
                  }
              
                  if (retryCount >= maxRetries) {
                    // console.error(
                    //   `Max retries (${maxRetries}) reached. Unable to load the page: ${currentHref}`
                    // );
                    // Handle the situation when the page can't be loaded after maximum retries.
                    await pageForEvaluation.close();
                    continue; // Move on to the next URL
                  }
              
                  await pageForEvaluation.close();
                } else {
                  await pool.query('DELETE FROM unvisited WHERE url = $1', [currentHref]);
                  // throw ('exist visited url farbod');
                }
            } catch (error) {
            // console.error('An error occurred:', error);
            }
        }
        
    } 
    
}
createBrowser().then ( () => {
    main()
})


