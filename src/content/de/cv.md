---
locale: de
person:
  name: Victor Elízio Pierozan
  tagline: Technical Lead · Berlin
  email: victorpierozan@gmail.com
  citizenship: Brasilianisch & Italienisch (EU-Arbeitserlaubnis)
  site: victor.pierozan.com
  links:
    - label: linkedin.com/in/victor-pierozan
      href: https://linkedin.com/in/victor-pierozan
    - label: github.com/vipierozan99
      href: https://github.com/vipierozan99
---

::summary
Technical Lead für kardiologische Medizinprodukte, vier Jahre in einem
Unternehmen, über Backend, Web und Mobile — eine Telemonitoring-Plattform für
über 2.000 Herzinsuffizienz-Patienten. Schreibe Produktionscode im Team und baue
dabei Infra, CI, Release, Observability und Teststack. Nah genug an der Klinik,
um mitzugestalten, was gebaut wird, unter IEC 62304, MDR, ISO 27001 und SOC 2.
::

## Berufserfahrung

::role{#noah-lead org="Noah Labs" from="2024-10"}
### Technical Lead

- Verantworte die technische Ausrichtung von vier Engineers über Backend, Web
  und Mobile. Habe den Prozess aufgesetzt, mit dem das Team ausliefert, und den
  technischen Hiring-Loop: Challenge entworfen, führe die Interviews.
- Habe das Stimm-Biomarker-Medizinprodukt konzipiert und gebaut: API,
  ML-Inference-Worker, dazwischen eine Job-Queue auf Postgres, dazu Infra, CI/CD
  und die Deployment-Plattform, auf der Product und R&D ausliefern. Alles per
  Terraform auf Google Cloud.
- Verantworte Observability, Delivery und Testinfrastruktur — OTel nach SigNoz,
  Grafana, Sentry; GitHub Actions, LaunchDarkly, Expo OTA. Dieselben Logs tragen
  die SOC-2-Nachweise, über Vanta.
- Withings-Drop-Shipment gebaut: Geräte gehen direkt an die Patienten,
  Bestellung und Tracking über die Hersteller-API.
- Einheitliche Anbindung kardialer Implantate konzipiert — Boston Scientific,
  Medtronic, Abbott und Biotronik speisen eine Pipeline, Kliniker sehen
  Übertragungen herstellerübergreifend gleich.

#stack
FastAPI · Postgres · Terraform · GCP · React · React Native
::

::role{#noah-fullstack org="Noah Labs" from="2024-04" to="2024-10"}
### Full-Stack-Entwickler

- Den Neubau der überarbeiteten Kliniker-Web-App und Patienten-App geleitet:
  paralleles Repository, Umstellung in einem Zug.
- Ein auseinandergelaufenes Designsystem auf Material UI konsolidiert, State auf
  Jotai und TanStack Query umgestellt. Typsicheres Tolgee-Übersetzungssystem
  gebaut, das ungenutzte Keys selbst erkennt — mit Playwright und CI/CD.
- Die klinischen Workflow-Screens gebaut — Onboarding, Patientendaten und
  Alarmkonfiguration, damit Kliniker selbst festlegen, was eskaliert.

#stack
TypeScript · React · React Native · Expo · Material UI
::

::role{#noah-backend org="Noah Labs" from="2022-10" to="2024-04"}
### Backend-Entwickler

- Das Plattform-Backend von Grund auf gebaut — FastAPI, Postgres, Python-Worker
  und Kafka (Redpanda), alle mit Patientendaten, dockerisiert auf Hetzner.
- Die klinische Domäne modelliert — Gesundheitsdatenmodell, konfigurierbare
  Alarme, dynamische Fragebögen, Mandantentrennung.
- CI-, Review- und Release-Prozess des Teams etabliert, dazu zentrale
  Observability auf OpenTelemetry und SigNoz.
- Den Withings-Webhook-Abruf gebaut: Cursor pro Nutzer, mit dem Write-Ahead-Log
  committet, dazu ein Sweep für alles, was die Callbacks verpasst haben. Stirbt
  ein Worker mitten im Abruf, geht nichts verloren und nichts doppelt.
- Tests deklarieren im eigenen Docstring, welche Anforderung sie abdecken.
  pytest- und Vitest-Plugins ernten das maschinenlesbar ein — der
  IEC-62304-Nachweisbericht entsteht aus einem CI-Lauf, statt von Hand.

#stack
FastAPI · SQLAlchemy · Postgres · Kafka (Redpanda) · NGINX · Hetzner · Docker
::

::role{#fraunhofer org="Fraunhofer IPT" from="2022-08" to="2023-04"}
### Fullstack-Entwickler

- Die Weboberfläche einer Simulationssoftware für Materialfluss und Schwindung
  von Glas gebaut — React, Material UI, Plotly.js, D3.js.
- Das Flask-/MongoDB-Backend auf FastAPI neu implementiert.

#stack
React · Plotly.js · D3.js · Material UI · FastAPI · MongoDB
::

::role{#galaxia org="GALAX.IA" from="2022-03" to="2022-08"}
### Data Scientist

- Automatische Leckerkennung für einen Wasserversorger aus Durchflusstelemetrie
  — Verarbeitung mit Pandas und NumPy, PyTorch-Modelle für Leckagesignaturen.

#stack
Python · Pandas · NumPy · PyTorch
::

::role{#lisha org="LISHA — UFSC" from="2021-02" to="2022-08"}
### ML-Forscher

- Fehlererkennung in Python und TensorFlow auf Steuergerätedaten von Renault.
- Qt- und Python-Tool zur Stapelauswertung ihrer internen Validierungstests.

#stack
Python · TensorFlow · Qt
::

::role{#tentaculo org="Tentáculo.Digital" from="2019-11" to="2020-09"}
### Full-Stack-Entwickler

- React- und React-Native-Oberflächen für die News-App eines nationalen Senders,
  ein Banking-Dashboard und ein Lebensmittel-Distributionssystem.
- Node-Services auf AWS Lambda mit MongoDB, ausgerollt über das Serverless
  Framework.
- Bekam oft, was dort noch niemand gemacht hatte — eine ETL-Pipeline mit
  PySpark, PostgreSQL und Glue, und einen dockerisierten WhatsApp-Bot.

#stack
React · React Native · Node · AWS Lambda · MongoDB · PySpark
::

## Ausbildung

::academia{#academia org="UFSC / RWTH" from="2018-02" to="2023-05" break}
:::entry{#bsc}
### B.Sc. Mechatronik — fünfjähriger integrierter Studiengang

Zehn Semester Vollzeit — Brasilien führt Ingenieurstudiengänge als einen
Fünfjahreszyklus, nicht als 3+2. In Regelstudienzeit, nichts nicht bestanden,
Schnitt 8,21/10. Ein Teil an der RWTH Aachen, in ML und verteiltem Rechnen auf
Masterniveau.
:::

:::entry{#thesis}
### Data-driven Anomaly Detection of Engine Knock based on Automotive ECU

SBESC 2022, zugleich die Abschlussarbeit: ML auf Steuergeräte-Zeitreihen zur
Erkennung von Motorklopfen.
[IEEE Xplore](https://ieeexplore.ieee.org/document/9965059)
:::
::

## Kenntnisse {.closing}

::skills
```yaml [props]
items:
  - { key: lang, value: "Python · TypeScript · SQL · Rust · C/C++" }
  - { key: back, value: "FastAPI · SQLAlchemy · Pydantic · Postgres · Alembic · Kafka (Redpanda)" }
  - { key: front, value: "React · React Native · Expo · TanStack Query · Material UI" }
  - { key: infra, value: "GCP · Hetzner · Docker · Terraform · GitHub Actions · NGINX · Linux" }
  - { key: obs, value: "OpenTelemetry · Grafana · SigNoz · Sentry" }
  - { key: test, value: "Playwright · Vitest · testcontainers" }
  - { key: data, value: "PyTorch · TensorFlow · Pandas · NumPy" }
  - { key: reg, value: "IEC 62304 · MDR · DSGVO · ISO 27001 · SOC 2" }
```
::

## Projekte {.closing}

Eine Wetterstation um einen ESP32 — Firmware, MQTT-Telemetrie,
Grafana-Dashboards, 3D-gedrucktes Gehäuse. Dieser Lebenslauf ist ebenfalls ein
Nebenprojekt.

## Nach Feierabend {.closing}

Pfadfinder — daher das Wandern und Campen. Gitarre, DIY-Elektronik und 3D-Druck.

## Sprachen {.closing}

- Portugiesisch (Muttersprache)
- Englisch (C1, TOEFL)
