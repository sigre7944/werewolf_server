var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
var axios = require('axios')
var mongoUrl = 'mongodb://werewolf_minhchinh_01:Haigay1997@ds057000.mlab.com:57000/werewolf_01'

router.get('/', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        db.collection('Roles').find({}, {cardName: 1, description: 1, _id: 0}).toArray( (err, result) => {
            if(err) console.log(err)

            res.send(result)
        })

    })
})

module.exports = (io) => {

    const getCards = async (socket) => {
        await axios({
            method: 'get',
            url: 'http://192.168.1.4:3001/get-roles'
        })
        .then(res => {
            socket.emit('GetCards', res.data)
        })
        .catch(err => console.log(err))
    }


    io.of('get-cards').on('connect', socket => {
        getCards(socket)

        io.of('get-cards').on('disconnect', () =>{
            console.log('user disconnected')
        })
    })

    return router
}