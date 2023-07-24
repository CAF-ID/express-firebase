module.exports = {
    name: 'Stalk Instagram',
    method: 'GET',
    desc: 'Ini deskripsi',
    path: '/stalk-ig',
    params: ['apikey', 'url'],
    status: true,
    exec: async(req, res) => {
        res.json({ name: 'Stalk Instagram' })
    },
    isLimit: true,
    isQuery: true
}