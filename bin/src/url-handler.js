import fs from "fs";
import puppeteer from "puppeteer";
import Utils from "./utils.js";

const utils = new Utils();


export default class UrlHandler {
    constructor() {}

    myGetPlaylistLinksFromFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }

                const urlList = data.split("\r\n");

                const withOutCommentesLines = urlList.filter((line) => {
                    if (line.charAt(0) !== "#" && line !== "") {
                        return line;
                    }
                });

                resolve(withOutCommentesLines);
            });
        });
    };

    myGetPlaylistURLs = async (url) => {
        return new Promise(async (resolve, reject) => {
            //
            // open a browser
            utils.output("Open browser");
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            //
            // find all links in page
            const selector = "a#thumbnail";
            const links = await page.$$(selector);
            //
            // put all links in a list
            utils.output("Find links");
            const hrefList = [];

            for (let link of links) {
                const href = await link.getProperty("href");
                const hrefString = await href.jsonValue();

                // remove strings with no link
                if (hrefString.length > 0) {
                    hrefList.push(await href.jsonValue());
                }
                utils.output(`finded ${hrefList.length} links`);
            }
            //
            // close the browser
            await browser.close();
            resolve(hrefList);
        });
    };
}
