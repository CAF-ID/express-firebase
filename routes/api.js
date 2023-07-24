const express = require('express');
const router = express.Router();
const { reduceLimit, checkLimit } = require("../database/db");



router.get('/:path', async(req, res) => {
    const getFitur = (Object.values(API.list).flat()).find((x) => x.path === ('/'+req.params.path)) || false;
    console.log(getFitur)
    const { isQuery, isLimit, params } = getFitur;
    if(!getFitur) return res.render('notFound', { layout: false, statusCode: res.statusCode });
    if(isQuery) {
        var noQuery = params.filter(param => !req.query[param] || req.query[param] === "");
        if (noQuery.length > 0) return res.json({ status: false, msg: `Masukkan Parameter ${noQuery[0]}` });
    }
    if(params.includes('apikey')) {
        var limit = await checkLimit(req.query.apikey);
        if(limit === false) return res.json({ status: false, msg: 'Apikey Tidak Valid' });
        if(limit < 1 && isLimit) return res.json({ status: false, msg: 'Limit apikey kamu telah habis' });
    }
    getFitur.exec(req, res).then(async() => {
        if(isLimit) return await reduceLimit(req.query.apikey);
    })
})


module.exports = router