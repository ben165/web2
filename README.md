
# Gedanken

Hey Jakob, wir haben diese Woche kaum noch Zeit uns zu unterhalten. Morgen ist voll und DO, FR sind finden ja vor Ort nicht wirklich statt. Vor dem WE würde ich aber gerne schon die Basics zu unserem Project in Web Eng. besprechen. Gedanken habe ich mir schon über das Spiel Tic, Tac Toe gemacht, ich denke das ist nicht so schwer wie Schiffe versenken (hier ist vor allem Frontend schwierig) aber schwierig genug um gute 10 Minuten zu sprechen.

Folgende Gedanken:

ALLGEMEIN
- Spiel hat 2 Spieler, also 2 Routen /player1 und /player2
- Updates erfolgen im Polling je 1 Sek
- Beide koennen ein Spiel starten, wenn momentan kein Spiel stattfindet (state 0)
- Jeder Spieler kann ein Spiel mittendrinn beenden, aber nur, wenn der andere Spieler damit auch einverstanden ist (state 1), Austausch von Infos.
- Man bekommt angezeigt, wenn der andere Spieler offline ist (Abfrage: Wann hat der letzte Spieler zuletzt gepollt > 2 oder 3 Sek)
- Falls der andere Spieler lange offline ist, kann auch der Spieler, der online ist, das Spiel alleine beenden
- Wenn das Spiel beendet ist kann jeder Spieler ein neues Spiel starten
- Anzeige wer gerade am Zug ist (Ich, Gegner)
- Fehlermeldung wenn falscher Spieler spielt
- Polling ausschalten wenn man selbst am Zug ist (Nachteil: Wenn andere Spieler Spiel abbrechen will bekommt man das nicht mit)

SPIELFELD
- Tabelle oder CSS columns, mit 3x3 Felder, jeweils 3 Bilder (unbesetzt, besetzt[spieler1], besetzt[spieler2])
- onclick events auf die Bilder mit Ruecksprache zum Server
- pulling new state data from Server mit javascript im Frontend (INTERVAL POLLING function)
- Server wertet aus, ob richtiger Spieler am Zug + ob Move gueltig ist
- Speicherung in Datenbank, checken ob Spiel gewonnen oder zu Ende ist, naechste Spieler am Zug


Das ist schon ziemlich viel zu ueberlegen und das reicht eigentlich schon um was ordentliches zu erstellen und darueber zu sprechen. Das Projekt ist aufwendiger als die Folien, die wir hatten.

Schiffe versenken ist vll. zu schwierig, vor allem die Frontend-Gestaltung. Tic Tac Toe machen vielleicht auch viele andere das waere halt auch doof weil man staendig das gleiche hoert. Vielleicht kennst du ein Game, das ebenfalls recht simpel ist aber dennoch anders.

# Änderungsvorschläge (von Jakob)

Simpleres Spiel als Schiffeversenken find ich gut, dann liegt nicht soviel Fokus auf dem Frontend.
Wäre aber eher für das Spiel 4Gewinnt, denke das ist ähnlich komplex wie Tic Tac Toe, aber nicht so langweilig zu spielen.

- Damit nicht nur ein Spiel stattfinden kann, sollte man einen "Raum" (also wahrscheinlich eine Route) definieren können. Damit kann ein anderer Spieler eingeladen werden, indem man ihm den Link schickt.

# Update Benjamin

4 Gewinnt klingt gut, an das Spiel habe ich gar nicht gedacht. Du willst viele Spiele auf einmal ermoeglichen, dass ist ein Feature, aber wie du das ohne jeweils den kompletten Gamestate in der DB speichern machen willst weiss ich nicht genau. Dann willst also nur die Aenderungen uebertragen.

- Schliessen des Browser und wiederoeffnen geht dann nicht, da der Gamestate so ja nicht wiederhergestellt werden kann.
- Was passiert bei kurzem Verbindungsabbruch? Ich denke der Gamestate wird ja nur einmal auf Anfrage "abgeholt" und dann aus der DB entfernt.
- Dann ist die Spiellogik komplett im Frontend. Also wo welcher Stein faellt oder hinfallen kann. Das weiss ja unser Backend dann gar nicht weil es nur zur Uebermittlung der Daten benutzt wird.
- Schummeln moeglich, weil man das Frontend umgehen kann. Wenn man einen Stein an eine Stelle setzt, die schon voll ist, was passiert dann am anderen Ende?

## Wie anfange?

Ich glaube auch, dass Frontend am Anfang wichtiger ist. Dann bekommt man erst das Gefühl, was man am Ende so alles im Backend braucht. Backend code ist vermutlich sogar einfacher zu proggen als der Frontend mit den Grafiken evt. Bewegungen.

Problem: Frontend muss man mit Vue machen? Also wir koennen das benutzen aber die Frage ist auch ob wie nicht einfach ein canvas haben das auf alles reagiert. Da ist am Ende dann nicht mehr viel Vue.js da.

Hab ganz wenig Erfahrung mit Vue.js, das hilft dir halt bei so Dingen wie klicke hier oder da und faerbe dann an einer anderen Stelle den Hintergrund blau etc. Ka wie uns das so weiterhelfen soll. 

# Besprechung 17.10

INDEX.HTML
- Neuen Spieltisch eröffnen
- (optional) Alle Spieltische anzeigen

ANZEIGE
- 4Gewinnt-Tabelle
- Wer am Zug ist
- Aufgeben/Remis/Neustart/Raum verlassen Button
- Meldung bei Spielende

DATENBANK
| id |      url       |    gamestate     |  currentPlayer |  winner  |
|----|----------------|------------------|----------------|----------|
| 1  | /room/player   | "0012101..."     |      2         |     1    |

