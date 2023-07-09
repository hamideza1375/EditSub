const translatte = require('translatte');

module.exports = async (data, { to = 'fa' }) => {
  return new Promise((resolve, reject) => {
    translatte(data, {
      from: 'en',
      to: to,
      agents: [
        'Mozilla/5.0 (Windows NT 10.0; ...',
        'Mozilla/4.0 (Windows NT 10.0; ...',
        'Mozilla/5.0 (Windows NT 10.0; ...'
      ],
      agents: 'windowsScriptHost',
      services:'windowsScriptHost'
    }).then(res => { resolve(res) })
      .catch(err => { console.error(err); });
  })

}
