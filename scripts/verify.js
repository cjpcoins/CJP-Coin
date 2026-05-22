import fs from 'fs';
import https from 'https';

const API_KEY = "BVMKXKD3YCFYN73QFVQPICCAWGR6DRPX4U";
const CONTRACT_ADDRESS = "0xA9B4a901400e959CF51a89Ed928e5aDb151bD395";
const CONTRACT_NAME = "CockroachJantaParty";
const SOURCE_CODE = fs.readFileSync('Flattened.sol', 'utf8');

const postData = new URLSearchParams({
    chainid: '56',
    apikey: API_KEY,
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: CONTRACT_ADDRESS,
    sourceCode: SOURCE_CODE,
    codeformat: '1',
    contractname: CONTRACT_NAME,
    compilerversion: 'v0.8.20+commit.a1b79de6',
    optimizationUsed: '0',
    runs: '200',
    licenseType: '3' // MIT
}).toString();

const options = {
    hostname: 'api.etherscan.io',
    port: 443,
    path: '/v2/api?chainid=56',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log("Response:", data);
    });
});

req.on('error', (e) => {
    console.error("Error:", e);
});

req.write(postData);
req.end();
