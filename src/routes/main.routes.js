import express from 'express';
import logger  from 'morgan';
import google from 'google';
import url from 'url';

const router = express.Router();
let nextCounter = 0;
google.resultsPerPage = 55;
router.use(logger('dev'));

router.get('/', (req, res) => {
  res.send({message: 'Hello World!!'});
});

const validateLink = (link) => {
  const parsedUrl = url.parse(link);

  if (parsedUrl.host.search("linkedin") == -1) {
    return false;
  } else if (parsedUrl.path.split('/')[1] != 'in') {
    return false;
  }

  return true;
};

router.get('/:searchParams', (req, res) => {
  const searchExpression = req.params.searchParams.split('-').join(' ');
  let searchedLinks = [];
  console.log(`Searching for ${searchExpression}`);

  google(searchExpression, (err, searchResult) => {
    if (err) {
      console.error(err);
    }

    searchResult.links.forEach( item => {
      if (validateLink(item.link)) {
        searchedLinks.push(item)
      }
    });

    if (nextCounter < 4) {
      nextCounter += 1;
      if (searchResult.next) {
        searchResult.next();
      } else {
        res.json({
          result: searchedLinks
        });
      }
    }
  });
});

export default router;
