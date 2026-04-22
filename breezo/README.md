# BREEZO Network

Decentralized air quality monitoring infrastructure for South Asia.

**Live data** from the [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) — free, no API key required.

---

## Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Framework    | React 18 + Vite                             |
| Routing      | React Router v6                             |
| Charts       | Recharts                                    |
| Icons        | Lucide React                                |
| Styling      | CSS Modules (no Tailwind, no UI library)    |
| Data         | Open-Meteo Air Quality API (free, no key)   |
| Fonts        | Bricolage Grotesque + DM Mono (Google Fonts)|

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

The app runs at `http://localhost:5173` by default.

---

## Project Structure

```
breezo/
├── index.html                    # Entry HTML, font imports
├── package.json
├── vite.config.js
│
└── src/
    ├── main.jsx                  # React root, BrowserRouter
    ├── App.jsx                   # Route definitions
    ├── index.css                 # Global CSS variables + resets
    │
    ├── lib/
    │   └── aqi.js                # AQI math, city coords, WHO limits, forecast logic
    │
    ├── hooks/
    │   ├── useAirQuality.js      # Data fetching + 5-min cache
    │   └── useScrollReveal.js    # Intersection Observer + counter animation
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx        # Navbar + Footer wrapper
    │   │   ├── Navbar.jsx        # Fixed nav with mobile hamburger
    │   │   └── Footer.jsx
    │   │
    │   ├── ui/
    │   │   └── UI.jsx            # Button, Chip, LivePill, SectionLabel, etc.
    │   │
    │   ├── home/
    │   │   ├── Hero.jsx          # Landing hero with live AQI panel + canvas
    │   │   ├── StatsBelt.jsx     # 4-stat animated counter row
    │   │   ├── CrisisSection.jsx # South Asia crisis stats
    │   │   ├── HowItWorks.jsx    # 4-step process grid
    │   │   ├── DepinSection.jsx  # DePIN 3-layer cards + token orbit viz
    │   │   └── VisionCTA.jsx     # Vision cards + CTA section
    │   │
    │   └── dashboard/
    │       ├── CitySelector.jsx      # City pill buttons
    │       ├── AQIHeroCard.jsx       # Big AQI number + health tip
    │       ├── MetricsGrid.jsx       # 6 pollutant cards with bars
    │       ├── TrendChart.jsx        # Recharts 24h area chart
    │       ├── ForecastRow.jsx       # 7-day forecast cards
    │       ├── WHOBars.jsx           # WHO compliance progress bars
    │       ├── HealthCards.jsx       # 4 health recommendation cards
    │       └── CityCompareChart.jsx  # Recharts bar chart — 6 cities
    │
    └── pages/
        ├── HomePage.jsx          # Assembles all home sections
        ├── DashboardPage.jsx     # Full dashboard layout
        ├── NetworkPage.jsx       # Network info + specs + roadmap
        └── AboutPage.jsx         # About, problem, team, mission
```

---

## Data Sources

### Air Quality API
- **Provider**: [Open-Meteo](https://open-meteo.com/en/docs/air-quality-api)
- **Free**: Yes — no API key, no rate limit for reasonable usage
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Parameters**: `pm2_5`, `pm10`, `nitrogen_dioxide`, `ozone`, `carbon_monoxide`, `sulphur_dioxide`
- **Coverage**: Global, hourly, 7-day forecast + 1-day historical
- **Cache**: 5 minutes in-memory per city key

### Cities Monitored
| Key  | City       | Country    | Coordinates          |
|------|------------|------------|----------------------|
| ktm  | Kathmandu  | Nepal      | 27.717N, 85.317E     |
| pkr  | Pokhara    | Nepal      | 28.209N, 83.985E     |
| del  | Delhi      | India      | 28.644N, 77.216E     |
| mum  | Mumbai     | India      | 19.076N, 72.877E     |
| lko  | Lahore     | Pakistan   | 31.549N, 74.343E     |
| dac  | Dhaka      | Bangladesh | 23.810N, 90.412E     |

### AQI Calculation
Uses the **US EPA AQI formula** based on PM2.5 concentration breakpoints.

### WHO Limits Used
| Pollutant | WHO Annual Mean Guideline |
|-----------|--------------------------|
| PM2.5     | 5 μg/m³                  |
| PM10      | 15 μg/m³                 |
| NO₂       | 10 μg/m³                 |
| SO₂       | 40 μg/m³                 |
| O₃        | 100 μg/m³ (8-hour mean)  |

---

## Adding More Cities

In `src/lib/aqi.js`, add to the `CITIES` object:

```js
export const CITIES = {
  // existing...
  cbm: { key: 'cbm', name: 'COLOMBO, SRI LANKA', label: 'Colombo', lat: 6.927, lon: 79.861 },
}
```

Then add `'cbm'` to `DISPLAY_CITIES` in `src/components/dashboard/CitySelector.jsx`.

---

## Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### Environment Variables
None required — the Open-Meteo API is fully public.

---

## License

MIT — build on it, fork it, deploy it.
