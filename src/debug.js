require('longjohn');

module.exports = function makeDebugger(app, store) {
    app.get('/debug/view', (req, res) => {
        res.send(store.__data);
    });
    app.post('/debug/injectData', (req,res)=>{
        Object.keys(store.__data).forEach(key=>delete store.__data[key]);
        Object.assign(store.__data, JSON.parse(req.body.data));
        res.send('ok');
    });
};
