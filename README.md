# Travel Guide App / Reiseführer App

Eine moderne Cross-Platform Reiseführer-App für Android und iOS, die GPS-Daten nutzt, um Sehenswürdigkeiten in der Nähe zu finden und Informationen von Wikitravel und LLM-Diensten bereitzustellen.

## Features

- 🗺️ **GPS-Integration**: Automatische Erkennung des aktuellen Standorts
- 📍 **Sehenswürdigkeiten in der Nähe**: Finde interessante Orte basierend auf deiner Position
- 🔍 **Manuelle Suche**: Suche nach Städten und Sehenswürdigkeiten
- 🌐 **Wikitravel-Integration**: Echte Reiseinformationen von Wikitravel.org
- 🤖 **LLM-Integration**: KI-generierte Beschreibungen und Reisetipps
- 🗺️ **Kartenmodus**: Interaktive Karte mit Markierungen
- 🌍 **Mehrsprachig**: Unterstützung für Deutsch und Englisch
- 📱 **Cross-Platform**: Läuft auf Android und iOS

## Installation

### Voraussetzungen

- Node.js (v14 oder höher)
- npm oder yarn
- Expo CLI
- Für iOS: Xcode (nur auf macOS)
- Für Android: Android Studio

### Setup

1. Abhängigkeiten installieren:
```bash
cd "D:\Projekte\Github\Reiseführer\Reisf-hrer"
npm install
```

2. App starten:
```bash
# Development Server starten
npm start

# Auf Android ausführen
npm run android

# Auf iOS ausführen (nur macOS)
npm run ios
```

## Projektstruktur

```
travel-guide-app/
├── App.js                 # Hauptkomponente mit Navigation
├── HomeScreen.js          # Startseite mit Sehenswürdigkeiten-Liste
├── MapScreen.js           # Kartenansicht
├── DetailsScreen.js       # Detailansicht für Orte
├── SettingsScreen.js      # Einstellungen (Sprache)
├── api.js                 # API-Services (Wikitravel, LLM)
├── i18n.js                # Mehrsprachigkeits-Konfiguration
├── package.json           # Abhängigkeiten
├── app.json              # Expo-Konfiguration
└── babel.config.js       # Babel-Konfiguration
```

## API-Integration

### Wikitravel

Die App nutzt die offizielle Wikitravel API, um Informationen über Städte und Sehenswürdigkeiten abzurufen.

### LLM-Integration

Für die KI-Funktionalität kann eine OpenAI API integriert werden:

1. OpenAI API-Schlüssel besorgen: https://platform.openai.com/api-keys
2. In `api.js` den Platzhalter-Code durch echte API-Aufrufe ersetzen:

```javascript
// In api.js, fetchLLMDescription Funktion:
const response = await axios.post('https://api.openai.com/v1/chat/completions', {
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: `Tell me about ${location}. ${context}`
    }
  ]
}, {
  headers: {
    'Authorization': `Bearer YOUR_API_KEY`,
    'Content-Type': 'application/json'
  }
});
return response.data.choices[0].message.content;
```

## Verwendung

### Startseite
- Zeigt automatisch Sehenswürdigkeiten in der Nähe basierend auf GPS
- Suchfeld für manuelle Ortssuche
- Pull-to-refresh zum Aktualisieren

### Karte
- Interaktive Karte mit deinem Standort
- Markierungen für Sehenswürdigkeiten
- Klicke auf Marker für Details

### Details
- Wikitravel-Informationen
- KI-generierte Beschreibungen
- Navigation und Routenplanung

### Einstellungen
- Sprachwechsel (Deutsch/Englisch)
- App-Informationen

## Berechtigungen

Die App benötigt folgende Berechtigungen:
- **Standort**: Um GPS-Daten zu nutzen und Orte in der Nähe zu finden
- **Internet**: Für API-Aufrufe zu Wikitravel und LLM-Diensten

## Technologie-Stack

- **React Native**: Cross-Platform Framework
- **Expo**: Development und Build-Tools
- **React Navigation**: Navigation zwischen Screens
- **React Native Maps**: Kartenintegration
- **Expo Location**: GPS und Standortdienste
- **i18next**: Mehrsprachigkeit
- **Axios**: HTTP-Requests

## Entwicklung

### Neue Features hinzufügen

Die App ist modular aufgebaut. Neue Screens können einfach hinzugefügt werden:

1. Neuen Screen in separater Datei erstellen
2. In App.js zur Navigation hinzufügen
3. Übersetzungen in i18n.js ergänzen

### Styling

Alle Komponenten nutzen StyleSheet aus React Native. Farben und Designs können in den jeweiligen Screen-Dateien angepasst werden.

## Deployment

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

## Lizenz

MIT License

## Support

Bei Fragen oder Problemen öffne ein Issue auf GitHub.

## Roadmap

- [ ] Offline-Modus mit gecachten Daten
- [ ] Favoriten speichern
- [ ] Augmented Reality für Sehenswürdigkeiten
- [ ] Social Sharing
- [ ] Reise-Tagebuch
- [ ] Push-Benachrichtigungen für Orte in der Nähe

---

Erstellt mit ❤️ für Reisende weltweit