var fs = require('fs');

let language_common = fs.readFileSync('./json/Language_common.json', 'utf8');
let language_in_excel = fs.readFileSync('./json/Language_in_excel.json', 'utf8');
let Language_err_code = fs.readFileSync('./json/Language_err_code.json', 'utf8');

let language_common_json = JSON.parse(language_common);
let language_in_excel_json = JSON.parse(language_in_excel);
let Language_err_code_json = JSON.parse(Language_err_code);

let languageMap = {
    en: {},
    zh: {},
    ja: {},
}

for (let k in language_common_json) {
    let lan = language_common_json[k];
    languageMap.zh[lan.key] = lan.zh;
    languageMap.en[lan.key] = lan.en;
    languageMap.ja[lan.key] = lan.ja;
}

for (let k in language_in_excel_json) {
    let lan = language_in_excel_json[k];
    languageMap.zh[lan.key] = lan.zh;
    languageMap.en[lan.key] = lan.en;
    languageMap.ja[lan.key] = lan.ja;
}

for (let k in Language_err_code_json) {
    let lan = Language_err_code_json[k];
    languageMap.zh[lan.key] = lan.zh;
    languageMap.en[lan.key] = lan.en;
    languageMap.ja[lan.key] = lan.ja;
}

var initLanguageConfig = function (languageTag) {
    let targetPath = `../client/assets/resources/i18n/${languageTag}.ts`;

    let resultStr = '\r\nconst win = window as any;\r\n\r\n';
    resultStr += "/** 这里的数据最终从语言表导出再写过来 */\r\n";
    resultStr += `export const languages = ${JSON.stringify(languageMap[languageTag], null, 4)};\r\n\r\n`;
    resultStr += "if (!win.languages) {\r\n";
    resultStr += `\twin.languages = {};\r\n`;
    resultStr += "}\r\n\r\n";
    resultStr += `win.languages.${languageTag} = languages;\r\n`;

    fs.writeFileSync(targetPath, resultStr);
}

for (let k in languageMap) {
    initLanguageConfig(k);
}
