#!/usr/bin/nodejs

import { State, otherPlayer } from './helper.js';
import sqlite3 from 'sqlite3';
import express from 'express'
import cors from 'cors';
const app = express();

let debugDB = {};

// MIDDLEWARE
app.use((req, res, next) => {
    console.log(req.hostname, req.path, req.method) // debugging
    next()
})
app.use(express.static('dist')) // static folder
app.use(express.urlencoded({ extended: true })) // post request
app.use(express.json()) // allow json requests
app.use(cors());

const emptyBoardStr = "0000000000000000000000000001200000021000000000000000000000000000";
const SEC10 = 10000;


function online(time) {
    return (time + SEC10 >= Date.now());
}


// DATABASE
const db = new sqlite3.Database('./game.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { return console.error(err.message) }
})


function clearDatabase(tableId) {
    // Duplicate 2
    const state = new State(1, 1, emptyBoardStr);
    const sql2 = `UPDATE game SET boardStr = ?, player = ?, winner = ?, moveStr = ?, turn = ?, cancel = ?, player1 = ?, player2 = ?, id1 = ?, id2 = ?, time1 = ?, time2 = ?, name1 = ?, name2 = ? WHERE gameid = ?`
    const replace = [state.boardStr, state.player, state.winner, state.moveStr(), state.turn, 0, 1, 2, 0, 0, 0, 0, "", "", tableId]
    db.run(sql2, replace, (err) => { if (err) { return console.log(err.message) } })
}


function restartGame(tableId, player1) { // player1 ist Farbe von Spieler 1
    const state = new State(1, 1, emptyBoardStr);
    const sql2 = `UPDATE game SET boardStr = ?, player = ?, winner = ?, moveStr = ?, turn = ?, cancel = ?, player1 = ?, player2 = ? WHERE gameid = ?`
    const replace = [state.boardStr, state.player, state.winner, state.moveStr(), state.turn, 0, otherPlayer(player1), player1, tableId]
    db.run(sql2, replace, (err) => { if (err) return console.log(err.message) })
}


function randomId() {
    let r = 0;
    while (r === 0) {
        r = Math.floor(Math.random() * Math.pow(2, 52));
    }
    return r;
}


function registerRowPlayerDB(tableId, n, id, time, username) {
    db.serialize(() => {
        const sql1 = `insert into game (gameid) values (?)`;
        db.run(sql1, [tableId], (err) => { if (err) { return console.log(err.message) } })

        // Duplicate 2
        const state = new State(1, 1, emptyBoardStr);
        const sql2 = `UPDATE game SET boardStr = ?, player = ?, winner = ?, moveStr = ?, turn = ?, cancel = ?, player1 = ?, player2 = ?, id1 = ?, id2 = ?, time1 = ?, time2 = ?, name1 = ?, name2 = ? WHERE gameid = ?`
        const replace = [state.boardStr, state.player, state.winner, state.moveStr(), state.turn, 0, 1, 2, 0, 0, 0, 0, "", "", tableId]
        db.run(sql2, replace, (err) => { if (err) return console.log(err.message) })

        // Duplicate3
        const sql3 = `UPDATE game SET id${n} = ?, time${n} = ?, name${n} = ? WHERE gameid = ?`;
        db.run(sql3, [id, time, username, tableId], (err) => { if (err) { return console.log(err.message) } })
    });
}


function registerPlayerDB(tableId, n, id, time, username) {
    // Duplicate3
    const sql3 = `UPDATE game SET id${n} = ?, time${n} = ?, name${n} = ? WHERE gameid = ?`;
    db.run(sql3, [id, time, username, tableId], (err) => { if (err) { return console.log(err.message) } })
}


app.get("/enter", (req, res) => {
    try {
        const tableId = Number(req.query.tableId);
        const username = req.query.username;
        const sql = `Select time1, time2 from game WHERE gameid = ?`;
        db.all(sql, [tableId], (err, rows) => {
            const id = randomId();
            if (err) {
                res.json({ userId: -10 })
            } else if (rows.length === 0) {
                registerRowPlayerDB(tableId, 1, id, Date.now(), username);
                res.json({ userId: id });
            } else {
                rows.forEach(row => {
                    const now = Date.now();
                    if (!online(row.time1)) {
                        registerPlayerDB(tableId, 1, id, Date.now(), username);
                        res.json({ userId: id });
                    } else if (!online(row.time2)) {
                        registerPlayerDB(tableId, 2, id, Date.now(), username);
                        res.json({ userId: id });
                    } else {
                        res.json({ userId: -1 });
                    }
                })
            }
        })
    } catch (error) {
        res.json({ userId: -100 })
    }
    return;
})


app.post("/cancel", (req, res) => {
    const playerId = req.body.player;
    const tableId = req.body.tableId;
    const sql = `Select cancel, player1 from game WHERE gameid = ?`
    db.all(sql, [tableId], (err, rows) => {
        if (err) { return res.json({ "status": 0 }) }
        rows.forEach(row => {
            let cancelDB = row.cancel
            cancelDB |= playerId
            if (cancelDB === 3) {
                restartGame(tableId, row.player1);
            } else {
                if (playerId === 0) {
                    cancelDB = 0;
                }
                const sql = `UPDATE game SET cancel = ? WHERE gameid = ?`
                db.run(sql, [cancelDB, tableId], (err) => { if (err) return console.log(err.message) })
            }
            res.json({ cancel: cancelDB })
        })
    })
})


app.get("/resetDB", (req, res) => {

    const sql1 = `drop table if exists game;`
    const sql2 = `CREATE TABLE "game" (
    	"id"	INTEGER,
    	"gameid"	INTEGER UNIQUE,
    	"boardStr"	TEXT,
    	"player"	INTEGER,
    	"winner"	INTEGER,
    	"moveStr"	TEXT,
    	"turn"	    INTEGER,
        "cancel"    INTEGER,
        "player1"   INTEGER,
        "player2"   INTEGER,
        "id1"       INTEGER,
        "id2"       INTEGER,
        "time1"     INTEGER,
        "time2"     INTEGER,
        "name1"     TEXT,
        "name2"     TEXT,
    	PRIMARY KEY("id")
    );`

    const sql3 = `insert into game (gameid) values (?)`
    db.run(sql1, [], (err) => {
        if (err) { return console.log(err.message) }
        db.run(sql2, [], (err) => {
            if (err) return console.log(err.message);
            res.json({ title: 'Info', info: 'Database deleted, created again.' })
        })
    })

})


app.get("/gameinfo", (req, res) => {
    const tableId = Number(req.query.tableId);
    const userId = Number(req.query.userId);
    const sql1 = `select boardStr, player, turn, winner, cancel, player1, player2, id1, id2, time1, time2, name1, name2 from game where gameid = ?`

    db.all(sql1, [tableId], (err, rows) => {
        if (err) { console.log(err.message) }
        rows.forEach(row => {
            let onlineStatus;
            let sql2;
            let opponent;
            let color;
            const now = Date.now();
            if (userId === row.id1) {
                color = row.player1;
                opponent = row.name2;
                onlineStatus = online(row.time2);
                sql2 = `update game set time1 = ? where gameid = ?`;
                db.run(sql2, [now, tableId]);
            } else if (userId === row.id2) {
                color = row.player2;
                opponent = row.name1;
                sql2 = `update game set time2 = ? where gameid = ?`;
                db.run(sql2, [now, tableId]);
                onlineStatus = online(row.time1);
            }
            return res.json({
                turn: row.turn,
                player: row.player,
                boardStr: row.boardStr,
                cancel: row.cancel,
                online: onlineStatus,
                opponent: opponent,
                color: color,
            })
        })
    })
})


app.post("/makeMove", (req, res) => {
    const playerMove = req.body.move;
    const playerId = req.body.player;
    const tableId = req.body.tableId;
    const sql = `select boardStr, moveStr, player, turn from game where gameid = ?`
    db.all(sql, [tableId], (err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row => {
            let boardStrDb = row.boardStr
            let playerDb = row.player
            let moveStrDb = row.moveStr
            let turnDb = row.turn
            if (playerDb === playerId && moveStrDb[playerMove] === "1") {
                let state = new State(turnDb, playerDb, boardStrDb)
                state.makeMove(playerMove)
                let newMoveStr = state.moveStr()
                let newBoardStr = state.boardStr
                let newPlayer = state.player
                let newTurn = state.turn
                const sql = `update game set moveStr = ?, boardStr = ?, player = ?, turn = ? where gameid = ?`
                db.run(sql, [newMoveStr, newBoardStr, newPlayer, newTurn, tableId], (err) => {
                    if (err) return console.log(err.message)
                    res.json({ "ok": 1 })
                })
            } else {
                res.json({ "ok": -1 })
            }
        })
    })
})


app.get("/debugDB", (req, res) => {

    const gameId = Number(req.query.gameId);
    const sql = `Select boardStr, player, winner, moveStr, turn, cancel, player1, player2, id1, id2, time1, time2, name1, name2 from game WHERE gameid = ?`
    db.all(sql, [gameId], (err, rows) => {
        if (err) return res.json({ "status": "Error executing debug sql" })
        rows.forEach(row => {
            debugDB = row
        })
        res.json(debugDB)
    })
})


app.get("/exampleDB", (req, res) => {
    const gameId = Number(req.query.tableId);
    const example = Number(req.query.example);

    const e1 = { "boardStr": "1111111101111111111111112111111122121111212222112222222122222220", "player": 1, "winner": 0, "moveStr": "0000000000000000000000000000000000000000000000000000000000000001", "turn": 59, "cancel": 0, "player1": 1, "player2": 2 };
    const e2 = { "boardStr": "0000000000000000000000000000000000000000000000001111111122222222", "player": 2, "winner": 0, "moveStr": "0000000000000000000000000000000000000000111111110000000000000000", "turn": 1, "cancel": 0, "player1": 1, "player2": 2 };

    const sql = `UPDATE game SET boardStr = ?, player = ?, winner = ?, moveStr = ?, turn = ?, cancel = ?, player1 = ?, player2 = ? WHERE gameid = ?`

    let exec = (e1) => { db.run(sql,[e1.boardStr, e1.player, e1.winner, e1.moveStr, e1.turn, e1.cancel, e1.player1, e1.player2, gameId],(err) => {
            if (err) return console.log(err.message)
        })};

    if (1 === example) { exec(e1); }
    else if ( 2 === example) { exec(e2); }

    res.json({ "ok": 1 })
})


app.use((req, res) => {
    res.status(404).send("<h2>Error</h2><p>Page not found</p>")
})


app.listen(3000)