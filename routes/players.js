var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient

var mongoUrl = 'mongodb://werewolf_minhchinh_01:Haigay1997@ds057000.mlab.com:57000/werewolf_01'


//to create a new user info or to update the existing one (when player wants to change username) if newUserBttn clicked
router.post('/create-or-update/:username', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)


        var username = req.body.username

        //to verify if the req.data.username already exists or not
        db.collection('Players').findOne({username: username}, (err, result) => {
            if(err) console.log(err)

            if(result !== null)
                res.send("username exists")
            else{
                //if not, update or insert one
                db.collection('Players').update({ip: req.ip}, {$set: {
                        username: username,
                        roomid: req.body.roomid,
                        ip: req.ip,
                        timeCreated: req.body.timeCreated
                }
                },
                {upsert: true} 
                , (err, result) => {
                    if(err) console.log(err)
                    
                    if(result !== null){

                        //update the related information based on username field in Rooms collection (if the row includes username field exists), remove the overlapping
                        //name in players array field
                        db.collection('Rooms').update({roomid: req.body.roomid}, {$set: { admin: username}, $pull: {players: req.body.oldUsername}}, (err, result) => {
                            if(err) console.log(err)

                            if(result !== null){
                                //add the current username
                                db.collection('Rooms').updateOne({roomid: req.body.roomid}, { $push: {players: req.body.username} }, (err, result) => {
                                    if(err) console.log(err)

                                    if(result !== null)
                                        res.send("ok")
                                    else
                                        res.send("not ok")

                                    db.close()
                                })
                            }

                            else
                                res.send("not ok")
                        })
                    }
                        
                })
            }
        })
    }) 
})



//return the response
router.get('/:username', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        var username = req.params.username.toString().replace('-', ' ')

        //to verify that the request's username is valid
        db.collection('Players').findOne({username: username}, (err, doc) => {
            if(err) console.log(err)
            
            if(doc !== null)
                res.send("ok")
            else
                res.send("not found")
            
            db.close()
        })

    })
})


//update the current user info if joinBttn clicked
router.post('/:username/update', (req, res, next) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if(err) console.log(err)

        var username = req.params.username.toString().replace('-', ' ')

        //update roomid field, other fields are fine
        db.collection('Players').update({username: username}, {$set: { roomid: req.body.roomid }}, (err, result) => {
            if(err) console.log(err)

            if(result !== null)
                res.send("ok")

            else
                res.send("not ok")

            db.close()
        })
    })
})

module.exports = router;