const querystring = require('querystring');
const utils = require('../../utils');
const constant = require('./constant.json')

/**
 * Decipher a signature based on action tokens.
 *
 * @param {Array.<string>} tokens
 * @param {string} signature
 * @returns {string}
 */
const decipher = (tokens, signature) => {
    let array = signature.split('');
    for (const token of tokens) {
        switch (token[0]) {
            case 'r':
                array = array.reverse();
                break;
            case 'w':
                array = swapHeadAndPosition(array, ~~token.slice(1));
                break;
            case 's':
                array = array.slice(~~token.slice(1));
                break;
            case 'p':
                array.splice(0, ~~token.slice(1));
                break;
        }
    }
    return array.join('');
};


/**
 * Swaps the first element of an array with one of given position.
 *
 * @param {Array.<Object>} arr
 * @param {number} position
 * @returns {Array.<Object>}
 */
const swapHeadAndPosition = (arr, position) => {
    const first = arr[0];
    arr[0] = arr[position % arr.length];
    arr[position] = first;
    return arr;
};


const jsVarStr = '[a-zA-Z_\\$][a-zA-Z_0-9]*';
const jsSingleQuoteStr = `'[^'\\\\]*(:?\\\\[\\s\\S][^'\\\\]*)*'`;
const jsDoubleQuoteStr = `"[^"\\\\]*(:?\\\\[\\s\\S][^"\\\\]*)*"`;
const jsQuoteStr = `(?:${jsSingleQuoteStr}|${jsDoubleQuoteStr})`;
const jsKeyStr = `(?:${jsVarStr}|${jsQuoteStr})`;
const jsPropStr = `(?:\\.${jsVarStr}|\\[${jsQuoteStr}\\])`;
const jsEmptyStr = `(?:''|"")`;
const reverseStr = ':function\\(a\\)\\{' +
    '(?:return )?a\\.reverse\\(\\)' +
    '\\}';
const sliceStr = ':function\\(a,b\\)\\{' +
    'return a\\.slice\\(b\\)' +
    '\\}';
const spliceStr = ':function\\(a,b\\)\\{' +
    'a\\.splice\\(0,b\\)' +
    '\\}';
const swapStr = ':function\\(a,b\\)\\{' +
    'var c=a\\[0\\];a\\[0\\]=a\\[b(?:%a\\.length)?\\];a\\[b(?:%a\\.length)?\\]=c(?:;return a)?' +
    '\\}';
const actionsObjRegexp = new RegExp(
    `var (${jsVarStr})=\\{((?:(?:${
        jsKeyStr}${reverseStr}|${
        jsKeyStr}${sliceStr}|${
        jsKeyStr}${spliceStr}|${
        jsKeyStr}${swapStr
    }),?\\r?\\n?)+)\\};`);
const actionsFuncRegexp = new RegExp(`${`function(?: ${jsVarStr})?\\(a\\)\\{` +
    `a=a\\.split\\(${jsEmptyStr}\\);\\s*` +
    `((?:(?:a=)?${jsVarStr}`}${
        jsPropStr
    }\\(a,\\d+\\);)+)` +
    `return a\\.join\\(${jsEmptyStr}\\)` +
    `\\}`);
const reverseRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${reverseStr}`, 'm');
const sliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${sliceStr}`, 'm');
const spliceRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${spliceStr}`, 'm');
const swapRegexp = new RegExp(`(?:^|,)(${jsKeyStr})${swapStr}`, 'm');


/**
 * Extracts the actions that should be taken to decipher a signature.
 *
 * This searches for a function that performs string manipulations on
 * the signature. We already know what the 3 possible changes to a signature
 * are in order to decipher it. There is
 *
 * * Reversing the string.
 * * Removing a number of characters from the beginning.
 * * Swapping the first character with another position.
 *
 * Note, `Array#slice()` used to be used instead of `Array#splice()`,
 * it's kept in case we encounter any older html5player files.
 *
 * After retrieving the function that does this, we can see what actions
 * it takes on a signature.
 *
 * @param {string} body
 * @returns {Array.<string>}
 */
const extractActions = (body) => {
    const objResult = actionsObjRegexp.exec(body);
    const funcResult = actionsFuncRegexp.exec(body);
    if (!objResult || !funcResult) {
        return null;
    }

    const obj = objResult[1].replace(/\$/g, '\\$');
    const objBody = objResult[2].replace(/\$/g, '\\$');
    const funcBody = funcResult[1].replace(/\$/g, '\\$');

    let result = reverseRegexp.exec(objBody);
    const reverseKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = sliceRegexp.exec(objBody);
    const sliceKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = spliceRegexp.exec(objBody);
    const spliceKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');
    result = swapRegexp.exec(objBody);
    const swapKey = result && result[1]
        .replace(/\$/g, '\\$')
        .replace(/\$|^'|^"|'$|"$/g, '');

    const keys = `(${[reverseKey, sliceKey, spliceKey, swapKey].join('|')})`;
    const myreg = `(?:a=)?${obj
        }(?:\\.${keys}|\\['${keys}'\\]|\\["${keys}"\\])` +
        `\\(a,(\\d+)\\)`;
    const tokenizeRegexp = new RegExp(myreg, 'g');
    const tokens = [];
    while ((result = tokenizeRegexp.exec(funcBody)) !== null) {
        let key = result[1] || result[2] || result[3];
        switch (key) {
            case swapKey:
                tokens.push(`w${result[4]}`);
                break;
            case reverseKey:
                tokens.push('r');
                break;
            case sliceKey:
                tokens.push(`s${result[4]}`);
                break;
            case spliceKey:
                tokens.push(`p${result[4]}`);
                break;
        }
    }
    return tokens;
};

/**
 * Extract signature deciphering tokens from html5player file.
 *
 * @param {string} html5player_url
 * @param {Object} options
 * @returns {Promise<Array.<string>>}
 */
const getTokens = async (html5player_url, options) => {
    const body = await utils.getMiniPage(html5player_url, options);

    const tokens = extractActions(body);
    if (!tokens || !tokens.length) {
        throw Error('Could not extract signature deciphering actions');
    }
    return tokens;
};

const getMiniPage5playerURL = (source) => {
    const regex = /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/;
    const result = regex.exec(source);
    const html5player_url = result ? result[1] || result[2] : null;

    if (!html5player_url) throw Error('Unable to find html5player file');

    return new URL(html5player_url, constant.BASE_URL).toString();
};

/**
 * @param {Object} format
 * @param {string} signature
 */
const setDownloadURL = (format, signature) => {
    if (!format.url) return;
    try {
        const decodedUrl = decodeURIComponent(format.url)

        // Make some adjustments to the final url.
        const parsedUrl = new URL(decodedUrl);

        // This is needed for a speedier download.
        parsedUrl.searchParams.set('ratebypass', 'yes');

        if (signature) {
            // When YouTube provides a `sp` parameter the signature `sig` must go
            // into the parameter it specifies.
            parsedUrl.searchParams.set(format.sp || 'signature', signature);
        }

        format.url = parsedUrl.toString();
    } catch (err) {
        console.log(err)
    }
};

/**
 * Applies `sig.decipher()` to all format URL's.
 *
 * @param {Object} streamingData {"formats":  [format...], "adaptiveFormats": [format...]},
 * @param {Object} options
 * @param {string} source
 */
const decipherFormats = async (streamingData, source, options) => {
    const html5player_url = getMiniPage5playerURL(source);
    const tokens = await getTokens(html5player_url, options);

    const decipheredFormats = {};

    for (const type in streamingData) {
        const formats = streamingData[type];
        if (!Array.isArray(formats) || !formats.length) continue;

        decipheredFormats[type] = {};

        formats.forEach(format => {
            let cipher = format.signatureCipher || format.cipher;
            if (cipher) {
                Object.assign(format, querystring.parse(cipher));
                delete format.signatureCipher;
                delete format.cipher;
            }
            const signature = tokens && format.s ? decipher(tokens, format.s) : null;
            setDownloadURL(format, signature);
            decipheredFormats[type][format.url] = format;
        });
    }

    return decipheredFormats;
};

module.exports = {decipherFormats}