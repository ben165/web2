
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
- Folgender Vorschlag, damit die Datenbank nicht redundant ist: Wir halten im Backend KEINE Datenstruktur vor, die den Zusand des gesammten Spiels abbildet. Das Backend ist nur dazu da, die Datenbank zu aktualisieren und die Anfragen der Spieler zu bearbeiten. Die Gewinnbedingung checken wir nur im Frontend, wo für jeden Spieler jeweils eine Datenstruktur des Spiels existiert. Das hat den Vorteil, dass wir wenig Speicherbedarf auf dem Server haben und dieser daher theoretisch mehr Spiele gleichzeitig bearbeiten kann. (Weiß nicht wie realistisch das ist, aber dadurch hat die Datenbank jedenfalls einen Sinn)
