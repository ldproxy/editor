# Editor

Eine [VS Code](https://code.visualstudio.com) Extension, die Sie bei der Erstellung und Aktualisierung von [ldproxy](https://docs.ldproxy.net) Konfigurationen unterstützt.

## Aktueller Stand

Der erste stabile Release (`v1.0.0`) ist verfügbar.

### Verteilung

Derzeit ist die einzige Möglichkeit, die Erweiterung zu nutzen, das zur Verfügung gestellte Docker-Image, das eine Open-Source-Version von VS Code for the Web enthält.

### Funktionen

- Befehl `Create new entities`: bietet einen grafischen Assistenten zur automatischen Generierung von Provider- und Service-Konfigurationen aus Datenquellen.
- IntelliSense: zeigt verfügbare Properties in YAML-Konfigurationsdateien an.
- Syntax checks: erkennt unbekannte oder veraltete Properties in YAML-Konfigurationsdateien.
- Tooltips: zeigt die Dokumentation für Properties in YAML-Konfigurationsdateien an.

## Ausblick

- `v1.1.0` automatische Generierung und Bearbeitung von MapLibre-Styles
- `v2.0.0` allgemeine Verfügbarkeit der Erweiterung für VS Code Desktop (macOS, Windows, Linux)

## Installation

Das Docker-Image ist verfügbar unter `ghcr.io/ldproxy/editor`. Es erwartet, dass der Workspace unter `/data` gemountet wird. Die Anwendung läuft auf Port `80`.

Um den Editor mit Ihrem ldproxy-Konfigurationsverzeichnis in `/home/user/ldproxycfg` zu starten und ihn unter `http://localhost:8080` aufzurufen:

```sh
docker run -d -p 8080:80 -v /home/user/ldproxycfg:/data ghcr.io/ldproxy/editor
```

> [!NOTE]
> Der Zugriff auf den Editor via `http` funktioniert nur mit `localhost`. Um den Editor für Remote-Zugriff bereitzustellen, wird ein Reverse-Proxy mit `https` benötigt.

## Verwendung

Wenn Sie die Anwendung unter `http://localhost:8080` im Browser öffnen, sehen Sie das gemountete ldproxy-Konfigurationsverzeichnis auf der linken Seite. Sie können nun beginnen, Ihre Dateien zu bearbeiten.

Allgemeine Hilfe finden Sie in der Dokumentation zu [VS Code] (https://code.visualstudio.com/docs).

### Erstellen neuer Entities

Wenn Sie die [Befehlspalette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) öffnen und beginnen, `ldproxy` einzugeben, sollte der Befehl `ldproxy: Neue Entitäten erstellen` oben erscheinen. Wenn Sie ihn auswählen, wird der grafische Assistent in einem neuen Tab geöffnet.

Er ermöglicht es Ihnen, automatisch Provider- und Service-Konfigurationen aus _PostgreSQL/PostGIS_, _GeoPackage_ und _WFS_ Datenquellen zu generieren.

> [!NOTE]
> Wenn Sie versuchen, auf eine _PostgreSQL_-Datenbank auf demselben Host zuzugreifen, auf dem der Docker-Container läuft, müssen Sie `host.docker.internal` anstelle von `localhost` verwenden.

![](screenshot.png)

### IntelliSense (Autovervollständigung)

Um eine Liste aller verfügbaren Properties an einer bestimmten Stelle in einer YAML-Konfigurationsdatei zu erhalten, kann man `Ctrl+Space` drücken. (Es heißt `Trigger suggest` in der [Befehlspalette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette), dort wird auch der konfigurierte Hotkey angezeigt.)
Dann kann man mit den Cursor-Tasten durch die Vorschläge navigieren und mit `Enter` einen auswählen. Man kann auch vor oder nach dem Triggern anfangen zu tippen, um die Vorschläge einzugrenzen.

![](screenshot2.png)
