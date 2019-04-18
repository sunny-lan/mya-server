require('longjohn');
const exitHook = require('exit-hook');
const fs = require('fs');

module.exports = function makeDebugger(app, store) {
    function injectData(data) {
        Object.keys(store.__data).forEach(key => delete store.__data[key]);
        Object.assign(store.__data, data);
    }

    if (fs.existsSync('./dump.json')){
        injectData(JSON.parse(fs.readFileSync('./dump.json')));
        console.log('Loaded old data from dump.json')
    }

    app.get('/debug/view', (req, res) => {
        res.send(store.__data);
    });
    app.post('/debug/injectData', (req, res) => {
        injectData(JSON.parse(req.body.data));
        res.send('ok');
    });

    exitHook(() => {
        fs.writeFileSync('./dump.json', JSON.stringify(store.__data));
        console.log('saved data to dump.json');
    });
};
