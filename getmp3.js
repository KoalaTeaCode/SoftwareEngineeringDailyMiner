require('dotenv').config()
const db = require('monk')(process.env.MONGO_DB)
const posts = db.get('posts')
const getUrls = require('get-urls');
const Bluebird = require('bluebird');
const rp = require('request-promise');

let promises = [];
// {mp3: {$exists: false}}
// {mainImage: {$exists: false}}
// {featuredImage: {$exists: false}},
// {}, {limit: 40, skip: 140, sort : { date : -1 }}
// posts.find({featuredImage: {$exists: false}})
posts.find( {mp3: {$exists: false}})
  .each((post) => {
    let urls = getUrls(post.content.rendered);
    let values = urls.values();
    let mp3 = '';
    let mainImage = '';

    for (let url of values) {
      let extension = url.substr(url.length - 4);

      if (extension === '.mp3') {
        mp3 = url;
        break;
      }
    }

    // if (!post._links['wp:featuredmedia']) return;
    // let medieaPromise = rp(post._links['wp:featuredmedia'][0].href)
    //   .then((result) => {
    //     let json = JSON.parse(result);
    //     if (!json.guid.rendered) return;
    //
    //     let featuredImage = json.guid.rendered;console.log(featuredImage)
    //     return posts.update({id: post.id}, {
    //       $set: {
    //         featuredImage,
    //       },
    //     });
    //   })
    //   .catch((error) => { console.log(error); })
    // promises.push(medieaPromise);


    if (mp3) {
      let promise = posts.update({id: post.id}, {
        $set: {
          mp3,
        },
      });
      promises.push(promise);
    }
  })
  .then(() => {
    return Bluebird.all(promises);
  })
  .then(() => {
    console.log("done");
    process.exit();
  })
  .catch((error) => { console.log(error); })
