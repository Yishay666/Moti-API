const api = require('express').Router();

api.post('/add', (req, res) => {
    let { text, author, lang, year } = req.body;
    const doc = {};

    // format empties
    if(author == '') author = 'unknown'
    if(year == '') year = '0'

    // data validation
    let err = [];
    if(!(text.length > 6 && text.length < 250)) err.push('Quote Length Must Be 6-250.');
    if(/\d/.test(author)) err.push('Author Cannot Contain Numbers.');
    if(!(author.length > 4 && author.length < 35)) err.push('Author Length Must Be 4-35.');
    if(!(lang.length == 2)) err.push("Lang Must Be 2 Chars.")
    if(!(Number(year) && year.length == 4)) err.push('Year Must Be 4 Digits.')
    if(err.length) return res.send({ status: 'error', err })

    database.insert({
        text,
        author,
        lang,
        year: Number(year),
    }, (err, doc) => {
        if(err){
            return res.send({ status: 'error' })
        }
        return res.send({ status: 'success', doc })
    });
});

api.get('/get', (req, res) => {
    let { author, lang, before, after, all } = req.query;
    let filter = {};

    if(typeof author !== 'undefined' && author !== '') filter.author = author;
    if(typeof lang !== 'undefined' && lang !== '') filter.lang = lang;
    all = all == 'true' ? true : false;

    before = Number(before) && before.length == 4 ? +before : false;
    after = Number(after) && after.length == 4 ? +after : false;

    database.find(filter, (err, docs) => {
        if(err) throw err;
        if(docs.length === 0){
            res.send('Not Found')
        } else {
            docs = docs.map(doc => {
                delete doc._id;
                return doc;
            })

            // filter before and after
            if(!!before) {
                docs = docs.filter(doc => doc.year <= before && doc.year !== 0)
            }
            if(!!after) {
                docs = docs.filter(doc => doc.year >= after && doc.year !== 0)
            }

            // return 
            if(all) {
                res.send(docs)
            } else {
                res.send(docs[Math.floor(Math.random() * docs.length)])
            }
        }
    })
})

api.get('/info', (req, res) => {
    database.find({}, (err, docs) => {
        if(err) throw err;

        let langs = getLangs(docs);
        let authors = getAuthors(docs);

        res.json({
            langs: [langs],
            docs: docs.length,
            authors,
        });
    })
})
function getAuthors(docs){
    let authors = [];
    let lines = [];

    // get the data into two arrays, like this:
    // authors = ['X', 'Y', 'Z'];
    // lines =   [ 1,   1,   1]
    docs.map(doc => {
        if(authors.includes(doc.author)) {
            // if author already in list, just increase his lines
            lines[authors.indexOf(doc.author)]++;
        } else {
            // author not in list, add him to authors list, and set his lines to 1
            authors.push(doc.author);
            lines.push(1)
        }
    });

    let res = [];
    // format it, like this
    // res = [
    //  {author: 'X', lines: 2},
    //  {author: 'Y', lines: 5},
    //  {author: 'Z', lines: 1},
    // ];
    for(var i = 0; i<authors.length;i++){
        res.push({author: authors[i], lines: lines[i]})
    }
    return res;
}
function getLangs(docs){
    let langs = [];
    docs.map(doc => {
        if(!langs.includes(doc.lang)) langs.push(doc.lang)
    })
    return langs;
}
module.exports = api;