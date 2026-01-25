# ldproxy for VS Code

Eine [VS Code](https://code.visualstudio.com) Extension, die Sie bei der Erstellung und Aktualisierung von [ldproxy](https://docs.ldproxy.net) Konfigurationen unterstützt.

## Aktueller Stand

- Die aktuelle stabile Version ist `v2.0.0`.
- Sie ist im VS Code Marketplace für macOS, Linux und Windows verfügbar.
- Sie kann als Webanwendung mithilfe des Docker-Image verwendet werden, das eine Open-Source-Version von VS Code for the Web enthält.

### Funktionen

- Befehl `Create Configuration Files`: bietet einen grafischen Assistenten zur automatischen Generierung von Provider- und Service-Konfigurationen aus Datenquellen und zur automatischen Generierung von Value-Konfigurationen (derzeit nur für MapLibre-Styles).
- IntelliSense: Autovervollständigung, zeigt verfügbare Properties in YAML-Konfigurationsdateien an.
- Syntax checks: erkennt unbekannte oder veraltete Properties in YAML-Konfigurationsdateien.
- Tooltips: zeigt die Dokumentation für Properties in YAML-Konfigurationsdateien an.

### Limitationen

- Das Wurzelverzeichnis des Workspace muss ein ldproxy Store-Verzeichnis sein, damit die Erweiterung ordnungsgemäß funktioniert. Übergeordnete Verzeichnisse, die mehrere Store-Verzeichnisse enthalten, werden derzeit nicht unterstützt, ebenso wenig wie Multi-Root-Workspaces.

## Installation

### VS Code Desktop

Öffnen Sie den Extension-View in der Aktivitätsleiste und suchen Sie nach _ldproxy_, dann installieren Sie die Erweiterung _ldproxy for VS Code_. [Dies](https://marketplace.visualstudio.com/items?itemName=iide.ldproxy-editor) ist ein direkter Link zur Erweiterung im VS Code Marketplace.

Nach der Installation können Sie ein ldproxy Store-Verzeichnis in VS Code öffnen, zum Beispiel über `Datei -> Ordner öffnen` oder indem Sie `code` in einem Terminal aufrufen. Sie können dann mit der Bearbeitung Ihrer Dateien beginnen.

### Docker

Das Docker-Image ist verfügbar unter `ghcr.io/ldproxy/editor`. Es erwartet, dass der Workspace unter `/data` gemountet wird. Die Anwendung läuft auf Port `80`.

Um den Editor mit Ihrem ldproxy-Konfigurationsverzeichnis in `/pfad/zu/ldproxy/cfg` zu starten und ihn unter `http://localhost:8080` aufzurufen:

```sh
docker run -d -p 8080:80 -v /pfad/zu/ldproxy/cfg:/data ghcr.io/ldproxy/editor
```

Wenn Sie die Anwendung unter `http://localhost:8080` im Browser öffnen, sehen Sie das gemountete ldproxy-Konfigurationsverzeichnis auf der linken Seite. Sie können nun beginnen, Ihre Dateien zu bearbeiten.

> [!NOTE]
> Der Zugriff auf den Editor via `http` funktioniert nur mit `localhost`. Um den Editor für Remote-Zugriff bereitzustellen, wird ein Reverse-Proxy mit `https` benötigt.

## Verwendung

Unbekannte oder veraltete Eigenschaften werden in geöffneten Dateien automatisch markiert. Wenn Sie mit der Maus über eine Eigenschaft fahren, wird die Dokumentation angezeigt.

Allgemeine Hilfe finden Sie in der Dokumentation zu [VS Code] (https://code.visualstudio.com/docs).

### IntelliSense (Autovervollständigung)

Um eine Liste aller verfügbaren Properties an einer bestimmten Stelle in einer YAML-Konfigurationsdatei zu erhalten, kann man `Ctrl+Space` drücken. (Es heißt `Trigger suggest` in der [Befehlspalette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette), dort wird auch der konfigurierte Hotkey angezeigt.)
Dann kann man mit den Cursor-Tasten durch die Vorschläge navigieren und mit `Enter` einen auswählen. Man kann auch vor oder nach dem Triggern anfangen zu tippen, um die Vorschläge einzugrenzen.

![](docs/screenshot2.png)

### Erstellen neuer Entities

Wenn Sie die [Befehlspalette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) öffnen und beginnen, `ldproxy` einzugeben, sollte der Befehl `ldproxy: Create Configuration Files` oben erscheinen. Wenn Sie ihn auswählen, wird der grafische Assistent in einem neuen Tab geöffnet.

Er ermöglicht es Ihnen, automatisch Provider- und Service-Konfigurationen aus _PostgreSQL/PostGIS_, _GeoPackage_ und _WFS_ Datenquellen zu generieren.

> [!NOTE]
> Wenn Sie versuchen, auf eine _PostgreSQL_-Datenbank auf demselben Host zuzugreifen, auf dem der Docker-Container läuft, müssen Sie `host.docker.internal` anstelle von `localhost` verwenden.

![](docs/screenshot.png)

### Erstellen neuer Werte

Wenn Sie die [Befehlspalette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) öffnen und beginnen, `ldproxy` einzugeben, sollte der Befehl `ldproxy: Create Configuration Files` oben erscheinen. Wenn Sie ihn auswählen, wird der grafische Assistent in einem neuen Tab geöffnet.

Derzeit können Sie damit nur automatisch einen MapLibre-Style aus einer Service-Konfiguration generieren.

![](docs/screenshot3.png)
