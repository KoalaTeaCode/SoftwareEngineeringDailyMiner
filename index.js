var rp = require('request-promise');


rp('https://softwareengineeringdaily.com/wp-json/wp/v2/posts')
    .then(function (htmlString) {
        // Process html...
        console.log(htmlString)
    })
    .catch(function (err) {
        // Crawling failed...
    });
