const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require("dotenv").config()

const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
        { id: 'url', title: 'URL' },
        { id: 'price', title: 'Price' },
    ],
});

const initialPage = 'https://www.hypersaz.com/';
const startUrlPattern = 'https://www.hypersaz.com/product.php?';

(async () => {
    let browser; // Declare the browser variable
        const proxyServer =
            'ss://YWVzLTI1Ni1nY206d0DVaGt6WGpjRA==@38.54.13.15:31214#main';
        // try {
        //     browser = await puppeteer.launch({
        //         headless: true, // Set to true for headless mode, false for non-headless
        //         executablePath:  process.env.NODE_ENV === "production" ?
        //           process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
        //         args: [
        //             '--no-sandbox',
        //             `--proxy-server=${proxyServer}`,
        //             '--disable-setuid-sandbox',
        //             '--enable-logging',
        //             '--no-zygote',
        //             '--single-process'
        //         ],
        //     });


        // } catch (error) {
        //     console.error('Error while launching the browser:', error);
        // }


    const processedHrefs = new Set();
    const unprocessedHrefs = new Set();

    async function processPage(pageUrl) {
        let browser; 
        console.log('Processing Page:', pageUrl);
        try {
            browser = await puppeteer.launch({
                        headless: true, // Set to true for headless mode, false for non-headless
                        executablePath:  process.env.NODE_ENV === "production" ?
                          process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
                        args: [
                            '--no-sandbox',
                            `--proxy-server=${proxyServer}`,
                            '--disable-setuid-sandbox',
                            '--enable-logging',
                            '--no-zygote',
                            '--single-process'
                        ],
                    });
                    console.log('broeswerrrr',browser)
            const page = await browser.newPage();
            await page.goto(pageUrl, { timeout: 120000 });
            await page.screenshot();
            const priceElement = await page.$x(
                '/html/body/section[2]/div/div/div[3]/div/ul/li[2]/p/span'
            );
            if (priceElement.length > 0) {
                const priceText = await page.evaluate(
                    (el) => el.textContent,
                    priceElement[0]
                );
                if (priceText.trim() !== '') {
                    const record = [{ url: pageUrl, price: priceText.trim() }];
                    await csvWriter.writeRecords(record);
                    console.log(`Saved: URL: ${pageUrl}, Price: ${priceText.trim()}`);
                }
            }
            const hrefs = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links.map((link) => link.getAttribute('href'));
            });
    
            for (const href of hrefs) {
                if (href && !processedHrefs.has(href)) {
                    if (!href.startsWith('https://')) {
                        var outputUrl = initialPage + href;
                    } else {
                        var outputUrl = href;
                    }
                    if (outputUrl.startsWith(startUrlPattern)) {
                        unprocessedHrefs.add(outputUrl);
                    }
                }
            }
            await page.close();
          } catch (error) {
            console.error('An error occurred while navigating to the page farbooood:', error);
            // Handle the error as needed
          }

        
    }

    try {
        unprocessedHrefs.add(initialPage);

        while (unprocessedHrefs.size > 0) {
            const currentHref = Array.from(unprocessedHrefs)[0];
            unprocessedHrefs.delete(currentHref);
            processedHrefs.add(currentHref);

            const pageForEvaluation = await browser.newPage();

            let retryCount = 0;
            const maxRetries = 10000; // Define the maximum number of retries

            while (retryCount < maxRetries) {
                try {
                    await processPage(currentHref); // Increase the timeout to 30 seconds
                    break; // If successful, break out of the loop
                } catch (error) {
                    if (error.name === 'TimeoutError') {
                        console.error(
                            `Timeout occurred (Retry ${retryCount + 1}/${maxRetries}). Retrying...`
                        );
                        retryCount++;
                    } else {
                        throw error; // Rethrow other errors
                    }
                }
            }

            if (retryCount >= maxRetries) {
                console.error(
                    `Max retries (${maxRetries}) reached. Unable to load the page: ${currentHref}`
                );
                // Handle the situation when the page can't be loaded after maximum retries.
                await pageForEvaluation.close();
                continue; // Move on to the next URL
            }

            await pageForEvaluation.close();
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
