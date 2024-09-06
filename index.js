const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const cheerio = require("cheerio");
const axios = require("axios");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.post("/compare-lists", async (req, res) => {
  const list1 = req.body.list1;
  const list2 = req.body.list2;

  console.log('list1=>', list1);
  console.log('list2=>', list2);

  try {
    // const data1 = await cardNamesScraper('https://manabox.app/decks/NzWns2ueTeO8p0S0mDEkVw');
    // const data2 = await cardNamesScraper('https://manabox.app/decks/YXqudGQaSMyQX3LuBjyhRQ');

    const data1 = await cardNamesScraper(list1);
    const data2 = await cardNamesScraper(list2);

    const intersections = compareListCards(data1, data2);

    // cleaning garbage
    intersections.shift();
    intersections.shift();
    intersections.pop();

    res.set('Content-Type', 'text/html');
    res.send(Buffer.from(`
      <div>
        <h2>Resultados</h2>
        <br /><br />
        ${intersections.map( value => {
          return "<p>"+value+"</p><br/>";
        }).toString().replace(',', '')}
      </div>
    `));

    // return res.status(200).json({
    //   result: intersections,
    //   size: intersections.length
    // });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(5000, () => {
  console.log('server started at 5000')
});

async function cardNamesScraper(URL) {
  const result = [];
  await axios(URL).then((response) => {
    const html_data = response.data;
    const $ = cheerio.load(html_data);
    
    const keys = ["Title","Description","Price"];
    const selectedElem = ".text-sm.font-medium"
    
    $(selectedElem).each((parentIndex, parentElem) => {
      let keyIndex = 0;
      const data = {};
      if (parentIndex) {
        $(parentElem)
        .each((childId, childElem) => {
          const value = $(childElem).text();    
          result.push(value);
        });
      }
    });
  });
  return result;
}

function compareListCards(data1, data2) {
  const results = [];
  const set1 = new Set(data1);
  const set2 = new Set(data2);

  set1.forEach(element => {
    if (set2.has(element)) {
      results.push(element);
    }
  });

  // const intersec = set1.intersection(set2);
  // console.log('intersec==>', intersec);
  console.log('results==>', results);
  return results;
}