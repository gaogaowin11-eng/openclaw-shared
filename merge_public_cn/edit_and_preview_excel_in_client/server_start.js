const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ip = require('ip');
const { exec } = require('child_process');
let localIP = ip.address();

console.log(`Local IP address: ${localIP}`);

function openUrlInBrowser(url) {
    // 对于Windows系统
    exec(`start ${url}`);
    // 对于macOS和Linux系统
    // exec(`open ${url}`);
}

function startServer() {
    const server = http.createServer((req, res) => {
        // Use cors middleware
        const root = __dirname;
        // console.log("root: " + root);

        cors()(req, res, () => {

            let requrl = req.url;
            if (requrl.indexOf("index.html/?") > -1) {
                requrl = requrl.substring(0, requrl.indexOf("index.html/?")) + "index.html";
            } else if (requrl.indexOf("index.html/") > -1) {
                requrl = requrl.replace("index.html/", "");
            }

            let filePath = path.join(root, requrl);
            // console.log("req.url: " + req.url);

            // Check if the file exists
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found\n');
                    return;
                }
                if (stats.isDirectory()) {
                    console.log("isDirectory: " + filePath);
                    filePath = path.join(filePath, 'index.html');
                }
                // Determine the content type based on the file extension
                const extname = String(path.extname(filePath)).toLowerCase();
                const mimeTypes = {
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.css': 'text/css',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpg',
                    '.gif': 'image/gif',
                    '.wav': 'audio/wav',
                    '.mp4': 'video/mp4',
                    '.woff': 'application/font-woff',
                    '.ttf': 'application/font-ttf',
                    '.eot': 'application/vnd.ms-fontobject',
                    '.otf': 'application/font-otf',
                    '.svg': 'application/image/svg+xml'
                };
                const contentType = mimeTypes[extname] || 'application/octet-stream';
                // Read the file and send the response
                fs.readFile(filePath, (err, content) => {
                    // console.log(content);
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Internal Server Error\n');
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                });
            });
        });
    });

    const PORT = 3000;
    server.listen(PORT, () => {
        // preview link: http://172.16.1.5:3000/web-desktop/index.html
        // 访问资源：http://172.16.1.5:3000/拼接资源路径即可
        let remoteUrl = `http://${localIP}:${PORT}/assets/`;
        remoteUrl = encodeURIComponent(remoteUrl);
        // let previewLink = `http://${localIP}:${PORT}/web-desktop/index.html/?isPreview=true&remoteUrl=${remoteUrl}`;
        let params = JSON.stringify({ remoteUrl: remoteUrl, isPreview: true });
        params = encodeURIComponent(params);
        let previewLink = `http://${localIP}:${PORT}/web-desktop/index.html/?params=${params}`;
        console.log(`Preview link is: ${previewLink}`);

        openUrlInBrowser(previewLink);
    });
}

startServer();


