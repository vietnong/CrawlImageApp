const puppeteer = require('puppeteer');
const fs = require('fs');
const downloader = require('image-downloader');



const openPage = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return [browser, page];

}
const getLargestImageSetsFromPage = async (page, imageSelector) => {
    console.log('selector', imageSelector)
    const srcs = await page.evaluate((selector) => {
        const imgs = Array.from(document.querySelectorAll(selector));
        return imgs.map((img) => img.getAttribute('srcset'));
    }, imageSelector);
    console.log('srcs', srcs)
    return srcs;
}
const getImageSrcFromSrcSets = (srcs, index) => {
    const src = srcs[index];
    const imgSrc = src.split(', ');
    const imageSrc = `https:${imgSrc[imgSrc.length - 1].split(' ')[0]}`;
    console.log('imageSrc', imageSrc)
    return imageSrc;
}
const downloadImageToFolder = (imageSrc, folder) => {
    downloader.image({
        url: imageSrc,
        dest: folder
    });
}

const getImageSrcSets = async (url, selector) => {
    const [browser, page] = await openPage(url);
    const srcs = await getLargestImageSetsFromPage(page, selector);

    await browser.close();
    return srcs;
}

const main = (async () => {
    const CRAWL_URL = 'https://gotrangtri.vn/danh-muc/sofa/';
    const IMAGE_SELECTOR = '.wrap_product_image_fs img';
    const DOWNLOAD_FOLDER = './data';

    const srcs = await getImageSrcSets(CRAWL_URL, IMAGE_SELECTOR);

    if (!fs.existsSync(DOWNLOAD_FOLDER)) {
        fs.mkdirSync(DOWNLOAD_FOLDER)
    }
    for (let index = 0; index < srcs.length; index++) {
        const imageSrc = getImageSrcFromSrcSets(srcs, index);
        downloadImageToFolder(imageSrc, DOWNLOAD_FOLDER);
    }

})();