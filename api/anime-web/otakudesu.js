module.exports = {
    name: 'Otakudesu Search',
    method: 'GET',
    desc: 'Ini deskripsi',
    path: '/otakudesu-search',
    params: ['apikey', 'query'],
    status: false,
    exec: async(req, res) => {
        res.json({ name: 'Otakudesu Search'})
    },
    isLimit: true,
    isQuery: true
}

/**
 * note
 * isLimit => untuk pake limit fiturnya, dibagian array 'params' ada value 'apikey'-nya
 * isQuery => untuk biar bisa pake array 'params'
 */