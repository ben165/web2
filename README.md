# Install
1. clone repo
1. use `npm install` to install all packages
1. start server with `npm start` oder `nodejs app.js`
1. visit http://127.0.0.1:3000/


# Update 10.11.2023

## Routen
```
/create (GET)
  Setzt Board auf Anfangszustand zurueck. Tabelle game mit id 1 muss vorhanden sein.

Response (JSON):
  { title: 'Info', info: 'Empty Game field created' }
```

```
/cancel (POST)
  Abbrechen des Spiels je nach Spielernummer.

Request (JSON):
{
    "player": 1|2
}

Response (JSON):
{
  "cancel": 0|1|2|3
}
```

```
/create (GET)
  Resetet die Datenbank, erstellt eine Zeilte und fuellt gameid mit 1.
  Danach muss einmal /create aufgerufen werden.

Response (JSON):
{
  title: 'Info', info: 'Database deleted, created again and filles with gameid = 1.'
}
```

```
/gameinfo (GET)
  Momentaner Spielstand.

Response (JSON):
{
  "turn": 1,
  "player": 1,
  "boardStr": "0...12...0",
  "cancel": 0
}
```


```
/makemMove (POST):

Request (JSON):
{
    "player": 1|2
    "move": 30
}

Response (JSON) (bei Erfolg / nicht Erfolg):
{
  "ok": 1|-1
}
```


## Datenbank Struktur
```
CREATE TABLE "game" (
	"id"	INTEGER,
	"gameid"	INTEGER UNIQUE,
	"boardStr"	TEXT,
	"player"	INTEGER,
	"winner"	INTEGER,
	"moveStr"	TEXT,
	"turn"	INTEGER,
	"cancel"	INTEGER,
	PRIMARY KEY("id")
);
```


















