var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
var axios = require('axios')
var mongoUrl = 'mongodb://werewolf_minhchinh_01:Haigay1997@ds057000.mlab.com:57000/werewolf_01'

let cookies 

router.get('/', (req, res, next) => {
    cookies = req.cookies
    cookies = {
        'roomid': req.query.roomid,
        'username': req.query.username
    }
    res.send(cookies)
})


module.exports = (io) => {
    let roomid, username

    io.of('/handle-cookies').use( (socket, next) => {
        roomid = socket.handshake.query.roomid
        username = socket.handshake.query.username
        if(username.length > 0 && roomid.length > 0)
            return next()

        return next(new Error('room id does not exist'))
    })

    const testCookies = async (socket) => {
        await axios({
            method: 'get',
            url: 'http://192.168.1.4:3001/handle-cookies/' + roomid + '/' + username
        })
        .then(res => {
            socket.emit('GetCookies', res.data)
        })
        .catch(err => console.log(err))
    }

    io.of('/handle-cookies').on('connection', socket => {

        testCookies(socket)

        io.on('disconnect', () => {
            console.log('disconnected - cookies request form ' + username + ' - ' + roomid)
        })
    })


    return router
}