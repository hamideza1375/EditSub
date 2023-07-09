
const translate2 = require('./middleware/translate2');


translate2('hello how are you', {to:'fa'}).then((r)=>{console.log(r);})


// const RootPath = require('app-root-path');
// const fs = require('fs');
// const translatte = require('translatte');

// const txt = fs.readFileSync(RootPath + '/t.json')
// translatte(JSON.parse(txt), {
//   from: 'en',
//   to: 'fa',
//   agents: [
//     'Mozilla/5.0 (Windows NT 10.0; ...',
//     'Mozilla/4.0 (Windows NT 10.0; ...',
//     'Mozilla/5.0 (Windows NT 10.0; ...'
//   ],

// }).then(res => {
//   console.log(res);
// }).catch(err => {
//   console.error(err);
// });
