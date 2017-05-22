const rp = require('request-promise');
const querystring = require('querystring');
const fs = require('fs');
const db = require('monk')('mongodb://thehollidayinn:A!s2d3F$@ds137101.mlab.com:37101/sedaily')
const posts = db.get('posts')
const tags = db.get('tags')
const Bluebird = require('bluebird');
const moment = require('moment');

// @TODO: can we query by modified date? https://github.com/WP-API/WP-API/issues/472
// let query = {
//   date_query: [
//     {
//       'column'    : 'post_modified',
//       'after'     : new Date(),
//       'inclusive' : false
//     }
//   ]
// }
//
//
let query = {
  per_page: 100,
};
let wpQueryString = querystring.stringify(query);

const WPAPI = require( 'wpapi' );
const wp = new WPAPI({ endpoint: 'http://softwareengineeringdaily.com/wp-json/wp/v2/posts' });
let page = 1;

function findAdd(post) {
  return posts.findOne({id: post.id})
    .then((postFound) => {
      if (!postFound) {
        console.log("here")
        return posts.insert(post);
      }

      return;
    })
}

function getPosts(page) {

  query.page = page;
  wpQueryString = querystring.stringify(query);

  rp(`http://softwareengineeringdaily.com/wp-json/wp/v2/posts?${wpQueryString}`)
    .then(function (response) {
      let promises = [];

      let postsResponse = JSON.parse(response);
      console.log(postsResponse.length)
      if (postsResponse.length === 0) return false;
      for (let post of postsResponse) {
        post.date = moment(post.date).toDate();
        // let updatePromise = posts.update({id: post.id}, post, {upsert: true});
        promises.push(findAdd(post));
      }

      return Bluebird.all(promises);
    })
    .then((result) => {
      if (!result) {
        db.close();
        return;
      };

      page += 1;console.log(page)
      getPosts(page)
    })
    .catch(function (err) {
      console.log(err)
    });
}

function getTags(page) {

  query.page = page;
  wpQueryString = querystring.stringify(query);

  rp(`http://softwareengineeringdaily.com/wp-json/wp/v2/tags?${wpQueryString}`)
    .then(function (response) {
      let promises = [];

      let postsResponse = JSON.parse(response);
      console.log(postsResponse.length)
      if (postsResponse.length === 0) return false;
      for (let post of postsResponse) {
        let updatePromise = tags.update({id: post.id}, post, {upsert: true});
        promises.push(updatePromise);
      }

      return Bluebird.all(promises);
    })
    .then((result) => {
      if (!result) {
        db.close();
        return;
      };

      page += 1;console.log(page)
      getTags(page)
    })
    .catch(function (err) {
      console.log(err)
    });
}

// getTags(page);

getPosts(page);
