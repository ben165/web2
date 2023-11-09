#!/usr/bin/nodejs

import { State } from './helper.js';
import sqlite3 from 'sqlite3';
import express from 'express'
import cors from 'cors';
const app = express();

var debugDB = {};

// MIDDLEWARE
app.use((req, res, next) => {
    console.log(req.hostname, req.path, req.method) // debugging
    next()
})
app.use(express.static('static')) // static folder
app.use(express.urlencoded({ extended: true })) // post request
app.use(express.json()) // allow json requests
app.use(cors()); // TODO: Rausnehmen beim deployen



// DATABASE
const db = new sqlite3.Database('./game.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})


app.get("/create", (req, res) => {

    let emptyBoardStr = "0000000000000000000000000001200000021000000000000000000000000000"

    let state = new State(1, 1, emptyBoardStr);

    let sql = `UPDATE game SET boardStr = ?, player = ?, winner = ?, moveStr = ?, turn = ?, cancel = ? WHERE gameid = 1`

    db.run(sql, [emptyBoardStr, state.player, 0, state.moveStr(), state.turn, 0], (err) => {
        if (err) return console.log(err.message)
    })

    res.json({ title: 'Info', info: 'Empty Game field created' })
})

/*
Route Cancel

{
    player: 1|2
}
 --> cancel


*/


app.get("/resetDB", (req, res) => {

    const sql1 = `drop table if exists game;`
    const sql2 = `CREATE TABLE "game" (
    	"id"	INTEGER,
    	"gameid"	INTEGER UNIQUE,
    	"boardStr"	TEXT,
    	"player"	INTEGER,
    	"winner"	INTEGER,
    	"moveStr"	TEXT,
    	"turn"	INTEGER,
        "cancel"    INTEGER,
    	PRIMARY KEY("id")
    );`

    // Create one playing field with gameid = 1
    const sql3 = `insert into game (gameid) values (?)`
    db.run(sql1, [], (err) => {
        if (err) return console.log(err.message)
        db.run(sql2, [], (err) => {
            if (err) return console.log(err.message)
            db.run(sql3, [1], (err) => {
                if (err) return console.log(err.message)
                res.json({ title: 'Info', info: 'Database deleted, created again and filles with gameid = 1.' })
            })
        })
    })
})




app.get("/gameinfo", (req, res) => {
    const sql = `select boardStr, player, turn, winner, cancel from game where gameid = 1`

    db.all(sql, [], (err, rows) => {
        if (err) return res.json({ "status": "error getting game info" })
        rows.forEach(row => {
            return res.json({
                turn: row.turn,
                player: row.player,
                boardStr: row.boardStr,
                cancel: row.cancel
            })
        })
    })
})


app.post("/makeMove", (req, res) => {

    /*
    {
        "player": 1,
        "move": 30
    }
    
    Von Datenbank:
    - state (boardStr)
    - moveStr (was erlaubt ist)
    - currentPlayer, db: current
    - game02
    */

    const playerMove = req.body.move
    const playerId = req.body.player

    const sql = `select boardStr, moveStr, player, turn from game where gameid = 1`

    db.all(sql, [], (err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row => {
            let boardStrDb = row.boardStr
            let playerDb = row.player
            let moveStrDb = row.moveStr
            let turnDb = row.turn

            console.log("playerDb: ", playerDb, "playerId: ", playerId, "moveStrDb[playerMove]: ", moveStrDb[playerMove])
            if (playerDb === playerId && moveStrDb[playerMove] === "1") {
                console.log("Zug war in Ordnung.")
                let state = new State(turnDb, playerDb, boardStrDb)
                state.makeMove(playerMove)
                let newMoveStr = state.moveStr()
                let newBoardStr = state.boardStr
                let newPlayer = state.player
                let newTurn = turnDb + 1

                const sql = `update game set moveStr = ?, boardStr = ?, player = ?, turn = ? where gameid = 1`
                db.run(sql, [newMoveStr, newBoardStr, newPlayer, newTurn], (err) => {
                    if (err) return console.log(err.message)
                })
            }
        })
    })
    res.json({ "ok": 1 })
})



app.get("/debugDB", (req, res) => {

    const sql = `Select boardStr, player, winner, moveStr, turn, cancel from game WHERE gameid = 1`

    db.all(sql, [req.params.gameid], (err, rows) => {
        if (err) return res.json({ "status": "Error executing debug sql" })
        rows.forEach(row => {
            debugDB = row
        })
        res.json(debugDB)
    })
})




app.use((req, res) => {
    res.status(404).send("<h2>Error</h2><p>Page not found</p>")
})





app.listen(3000)