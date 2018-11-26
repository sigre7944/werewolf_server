var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient
var axios = require('axios')
var mongoUrl = 'mongodb://werewolf_minhchinh_01:Haigay1997@ds057000.mlab.com:57000/werewolf_01'


//create or update if newRoomBttn clicked
router.post('/create-or-update/:roomid', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        //to update the current player's data row in Players collection
        db.collection('Players').update({username: req.body.admin}, {$set: {roomid: req.body.roomid}}, (err, result) => {
            if(err) console.log(err)

            if(result === null){
                res.send("cannot find player")
            }
        })


        //to delete the old roomid collection (which was generated or not) whose admin is the request.data.username
        db.collection('Rooms').findOne({admin: req.body.admin}, (err, result) => {
            if(err) console.log(err)

            if(result !== null){
                
                //delete if we found the existing one
                db.dropCollection(result.roomid + "-history-log", (err, result) => {
                    if(err) console.log(err)

                })
            }

        })

        //update or create a row if it doesnt exist
        db.collection('Rooms').update({admin: req.body.admin}, { $set: {
                                                                    roomid: req.body.roomid, 
                                                                    admin: req.body.admin, 
                                                                    players: [req.body.players]
                                                                    , 
                                                                    numberOfPlayers: 1,
                                                                    timeCreated: req.body.timeCreated
                                                                }}, {upsert: true}, (err, result) => {
            if(err) console.log(err)

            if(result !== null){

                //to create a roomid-history-log collection based on the current req.data.roomid
                db.createCollection(req.body.roomid + "-history-log", {strict : true},  (err, collection) => {
                    if(err) console.log(err)
                                
                    collection.insertOne({
                        timeCreated: req.body.timeCreated,
                        moves: req.body.moves
                    }
                    , (err, result) => {
                        if(err) console.log(err)
                        
                        if(result !== null){
                            res.send("ok")
                        }
                        
                        db.close()
                    })
                })
            }
        })
    }) 
})


//response 
router.get('/:roomid', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        //to verify that the req.params.roomid exists both in Rooms collection and db as a collection
        db.collection("Rooms").findOne({roomid: req.params.roomid}, (err, result) => {
            if(err) console.log(err)

            if(result !== null){
                // db.listCollections({}, {nameOnly: true}).toArray((err, result) => {
                //     result.forEach(data => {
                //         if(data.name === req.params.roomid)
                //             res.send("ok")
                //     })
                    
                //     res.send("not ok")
                //     db.close()
                // })
                res.send("ok")
            }

            else
                res.send("not found")

            db.close()
        })
    })
} )


//update the related roomid if joinBttn clicked
router.post('/:roomid/update', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        var username = req.body.username


        //increase the numberOfPlayers field and push the new username into players field
        db.collection('Rooms').update({roomid: req.body.roomid}, { $inc: { numberOfPlayers: 1 },  $push: {"players": username} } , (err, result) => {
            if(err) console.log(err)

            if(result !== null){

                // //take out the old username
                // db.collection('Rooms').update({roomid: req.body.roomid}, {$pull: { players: req.body.oldUsername }}, (err, result) => {
                //     if(err) console.log(err)

                //     if(result !== null)
                //         res.send("ok")
                //     else
                //         res.send("not ok")
                    
                //     db.close()
                // })
                res.send("ok")
            }  

            else{
                res.send("not ok")
            }

            db.close()
        })
    })
})

//get admin of the room
router.get('/:roomid/get-admin', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        //send back the admin of the current room id
        db.collection('Rooms').findOne({roomid: req.params.roomid}, {numberOfPlayers: 1, admin: 1, _id: 0}, (err, result) => {
            if(err) console.log(err)

            
            if(result !== null)
                res.send(result)
            else
                res.send('not ok')

            db.close()
        })
    })
})


module.exports = (io) => {

    let roomid

    io.of('/get-admin').use( (socket, next) => {
        roomid = socket.handshake.query.roomid
        if(roomid.length > 0)
            return next()

        return next(new Error('Cannot find room id'))
    } )

    
    const findAdmin = async () => {
        await axios({
            method: 'get',
            url: 'http://192.168.1.4:3001/rooms/' + roomid + '/get-admin'
        })
        .then(res => {
            io.of('/get-admin').emit('GetAdmin', res.data)
        })
        .catch(err => console.log(err)) 
    }

    io.of('/get-admin').on('connect', socket => {

        findAdmin()

        io.of('/get-admin').on('disconnect', () => {
            console.log('user disconnected')
        })
    })

    return router
};
