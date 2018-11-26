var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
var axios = require('axios')
var mongoUrl = 'mongodb://werewolf_minhchinh_01:Haigay1997@ds057000.mlab.com:57000/werewolf_01'


var players = []

//return players field for MainPage component
router.get('/:roomid', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        //return only players field
        db.collection('Rooms').findOne({roomid : req.params.roomid}, { players: 1, _id:0 }, (err, result) => {
            if(err) console.log(err)

            if(result !== 0 || result.length !== 0){
                players = result.players
                res.send("ok")
            }
            
            else
                res.send("not ok")

            db.close()
        })

    })
})

module.exports = (io) => {
    let roomid

    io.of('/main-page').use((socket, next) => {
        roomid = socket.handshake.query.roomid
        if(roomid.length > 0)
            return next()
        
        return next(new Error('roomid does not found'))
    })
    
    const getPlayers = async () => {
        await axios({
            method: 'get',
            url: 'http://192.168.1.4:3001/main-page/' + roomid
        })
        .then(res => {
            if(res.data === "ok")
                io.of('/main-page').emit('GetPlayers', players)
        })
        .catch(err => console.log(err))
    }

    io.of('/main-page').on('connection', socket => {
        getPlayers()
        io.of('/main-page').on('disconnect', () => {
            console.log('user disconnected')
        })
    })

    return router
};
