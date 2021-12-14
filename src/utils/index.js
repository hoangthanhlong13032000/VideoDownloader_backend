const miniget = require('miniget');
const puppeteer = require('puppeteer');

const os = [
    'Macintosh; Intel Mac OS X 10_15_7',
    'Macintosh; Intel Mac OS X 10_15_5',
    'Macintosh; Intel Mac OS X 10_11_6',
    'Macintosh; Intel Mac OS X 10_6_6',
    'Macintosh; Intel Mac OS X 10_9_5',
    'Macintosh; Intel Mac OS X 10_10_5',
    'Macintosh; Intel Mac OS X 10_7_5',
    'Macintosh; Intel Mac OS X 10_11_3',
    'Macintosh; Intel Mac OS X 10_10_3',
    'Macintosh; Intel Mac OS X 10_6_8',
    'Macintosh; Intel Mac OS X 10_10_2',
    'Macintosh; Intel Mac OS X 10_10_3',
    'Macintosh; Intel Mac OS X 10_11_5',
    'Windows NT 10.0; Win64; x64',
    'Windows NT 10.0; WOW64',
    'Windows NT 10.0',
];

const getMiniPage = async (url, options) => {
    const page = await miniget(url, options).text();
    if (!page) throw Error(`Get html page of ${url} error: (miniget error)`);

    return page;
}

const getFullPage = async (url) => {
    let page = undefined;
    try {
        const browser = await puppeteer.launch();
        const pup_page = await browser.newPage();
        page = await (await pup_page.goto(url, { timeout: 10000, waitUntil: 'domcontentloaded' })).text();
        browser.close();
    } catch (err) {
        throw Error(`Get html page of \"${url}\" error: ${err}`);
    }

    return page;
}

const getUserAgent = () => `Mozilla/5.0 (${os[Math.floor(Math.random() * os.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;

const getHeaders = () => ({
    "User-Agent": getUserAgent(),
    "accept": "application/json, text/plain"
});

const findObjects = (string, regex, start, end) => {
    let objects = string.split(regex).slice(1);
    if(!objects.length) return [];

    objects = objects.map(str => {
        let count = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] == start) count++;
            else if (str[i] == end) count--;
            if (count <= 0) {
                str = str.slice(0, i + 1);

                try { return JSON.parse(eval(`JSON.stringify(${str})`)) }
                catch (err) {
                    try { return JSON.parse(str) }
                    catch (err) { return undefined }
                }
            }
        }
    });
    return objects.filter(obj => obj);
}

const findStrings = (string, start, end) => {
    let strs = string.split(start).slice(1);
    if(!strs.length) return [];

    strs = strs.map(str => {
        const index = str.indexOf(end);
        if(index != -1) return str.slice(0, index)
        else return undefined;
    });
    return strs.filter(str => str);
}

module.exports = { getMiniPage, getFullPage, getHeaders, getUserAgent, findObjects, findStrings }
