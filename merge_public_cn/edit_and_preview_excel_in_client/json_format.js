const fs = require('fs');
const path = require('path');

let format = '0';
let dir='./temp_json';
let out_dir = './assets/Config'

// Parse arguments
// var i = 2;
// while ( i < process.argv.length) {
//     var arg = process.argv[i];

//     switch (arg) {
//         case '--format':
//         case '-f':
//             format = process.argv[i + 1];
//             i += 2;
//             break;
//         case '--dir':
//         case '-d':
//             src = './' + process.argv[i + 1] + '/';
//             i += 2;
//             break;
//         default:
//             i++;
//             break;
//     }
// }

fs.mkdirSync(out_dir, { recursive: true });

function readDir (out_dir) {
    let stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    let subpaths = fs.readdirSync(dir), subpath, size, md5, isPng, relative;
	let all_data={};
    for (let i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
		let name=subpaths[i].replace(/\.json$/, '');
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath);
        }
        else if (stat.isFile()) {
            let isJson = path.extname(subpath).toLowerCase() === '.json';
            if (!isJson)
                continue;
            
            let isExtra = subpath.includes("_Extra")
            let isLanguage = subpath.includes("Language_common") || subpath.includes("Language_in_excel")|| subpath.includes("Language_err_code")
            if (isExtra || isLanguage) {
                continue;
            }

            let jsonString = fs.readFileSync(subpath);
            let obj = JSON.parse(jsonString);
			all_data[name]=obj;

        }
    }
	let out_path=path.join(out_dir, "all_config.json");
	if (format == "1") {
		jsonString = JSON.stringify(all_data,"","\t");
		fs.writeFileSync(out_path, jsonString);
		console.log('format successfully : ' + out_path);
	}
	else {
		jsonString = JSON.stringify(all_data);
		fs.writeFileSync(out_path, jsonString);
		console.log('compress successfully : ' + out_path);
	}
}

readDir(out_dir);