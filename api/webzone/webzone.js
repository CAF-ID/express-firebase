module.exports = {
    name: 'Google Search',
    method: 'GET',
    desc: 'Ini deskripsi',
    path: '/google-search',
    params: ['apikey', 'query'],
    status: true,
    exec: async function(req, res) {
        res.json({ name: 'Google Search'})
    },
    isQuery: true,
    isLimit: true
}