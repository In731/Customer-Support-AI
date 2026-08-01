const dns = require('dns');
dns.resolveTxt('cluster0.masdhqk.mongodb.net', (err, addresses) => {
    if (err) {
        console.error("TXT Error:", err.message);
    } else {
        console.log("TXT Record:", addresses);
    }
});
