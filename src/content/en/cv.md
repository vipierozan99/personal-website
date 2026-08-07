---
locale: en
person:
  name: Victor Elízio Pierozan
  tagline: Technical lead · Berlin
  email: victorpierozan@gmail.com
  citizenship: Brazilian & Italian (EU work allowed)
  site: victor.pierozan.com
  links:
    - label: linkedin.com/in/victor-pierozan
      href: https://linkedin.com/in/victor-pierozan
    - label: github.com/vipierozan99
      href: https://github.com/vipierozan99
---

::summary
Technical lead in cardiac medical devices, four years at one company, across
backend, web and mobile, on a telemonitoring platform following over 2,000
heart-failure patients. Writing production code alongside the team, while
building the infra, CI, release, observability and test stack. Close enough to
the clinic to shape what gets built, under IEC 62304, MDR, ISO 27001 and SOC 2.
::

## Experience

::role{#noah-lead org="Noah Labs" from="2024-10"}
### Technical Lead

- Lead the technical direction for four engineers across backend, web and
  mobile. Set the process the team ships on, plus the technical hiring loop:
  designed the challenge, runs the interviews.
- Architected and implemented the voice-biomarker medical device: API, ML
  inference worker, a Postgres-backed job queue between, and the infra, CI/CD
  and deployment platform Product and R&D teams ship on. All with Terraform on
  Google Cloud.
- Own observability, delivery and test infrastructure — OTel into SigNoz,
  Grafana, Sentry; GitHub Actions, LaunchDarkly, Expo OTA. The same logging
  carries the SOC 2 evidence, on Vanta.
- Built Withings drop-shipment integration: devices ship direct to patients,
  with vendor API order submission and tracking.
- Architected a unified cardiac implant integration — Boston Scientific,
  Medtronic, Abbott and Biotronik feed one pipeline, so clinicians see
  transmissions consistently across vendors.

#stack
FastAPI · Postgres · Terraform · GCP · React · React Native
::

::role{#noah-fullstack org="Noah Labs" from="2024-04" to="2024-10"}
### Full Stack Developer

- Led the rebuild of the redesigned clinician web app and patient mobile app:
  parallel repository, cut over in one move.
- Consolidated a drifted design system on Material UI, moved state onto Jotai
  and TanStack Query. Implemented a Tolgee-based, type-safe translations system
  that auto-detects unused keys with Playwright testing and CI/CD.
- Built the clinical workflow screens — onboarding, patient data editing and
  alert configuration so clinicians configure what escalates.

#stack
TypeScript · React · React Native · Expo · Material UI
::

::role{#noah-backend org="Noah Labs" from="2022-10" to="2024-04"}
### Backend Developer

- Built the platform backend from scratch — FastAPI, Postgres, Python workers
  and Kafka (Redpanda), all carrying patient data, Dockerised on Hetzner.
- Modelled the clinical domain — health data model, configurable alerts,
  dynamic questionnaires and tenant isolation.
- Established the team's CI, review and release process, plus centralised
  observability on OpenTelemetry and SigNoz.
- Built the Withings webhook data fetching: per-user cursors committed with the
  write-ahead log and a sweep that refetches what the callbacks missed. Kill a
  worker mid-fetch and nothing is lost or duplicated.
- Tests declare the requirement they verify in their own docstrings. Built
  pytest and Vitest plugins that harvest it into machine-readable results, and
  the IEC 62304 evidence report is generated from a CI run rather than assembled
  by anyone.

#stack
FastAPI · SQLAlchemy · Postgres · Kafka (Redpanda) · NGINX · Hetzner · Docker
::

::role{#fraunhofer org="Fraunhofer IPT" from="2022-08" to="2023-04"}
### Fullstack Developer

- Built the web interface for a glass material-flow and shrinkage simulation
  package — React, Material UI, Plotly.js, D3.js.
- Reimplemented the Flask and MongoDB backend on FastAPI.

#stack
React · Plotly.js · D3.js · Material UI · FastAPI · MongoDB
::

::role{#galaxia org="GALAX.IA" from="2022-03" to="2022-08"}
### Data Scientist

- Automatic leak detection for a water utility from flow-rate telemetry —
  Pandas and NumPy processing, PyTorch models for leak signatures.

#stack
Python · Pandas · NumPy · PyTorch
::

::role{#lisha org="LISHA — UFSC" from="2021-02" to="2022-08"}
### ML Researcher

- Fault detection in Python and TensorFlow on Renault vehicle ECU data.
- Qt and Python tool for batch-analysing their internal validation tests.

#stack
Python · TensorFlow · Qt
::

::role{#tentaculo org="Tentáculo.Digital" from="2019-11" to="2020-09"}
### Full Stack Developer

- React and React Native interfaces for a national broadcaster's news app, a
  banking analytics dashboard and a food distribution system.
- Node services on AWS Lambda backed by MongoDB, deployed via the Serverless
  Framework.
- Often handed the work nobody there had done before — a PySpark, PostgreSQL
  and Glue ETL pipeline, and a dockerised WhatsApp bot.

#stack
React · React Native · Node · AWS Lambda · MongoDB · PySpark
::

## Education

::academia{#academia org="UFSC / RWTH" from="2018-02" to="2023-05" break}
:::entry{#bsc}
### B.Sc. Mechatronics Engineering — 5-year integrated degree

Ten semesters full time — Brazil runs engineering as one 5-year cycle, not 3+2.
On time, nothing failed, 8.21/10 average. Part of it at RWTH Aachen, in
master's-level ML and distributed computing.
:::

:::entry{#thesis}
### Data-driven Anomaly Detection of Engine Knock based on Automotive ECU

SBESC 2022, and the final thesis: ML on ECU time-series to detect engine knock.
[IEEE Xplore](https://ieeexplore.ieee.org/document/9965059)
:::
::

## Skills {.closing}

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
  - { key: reg, value: "IEC 62304 · MDR · GDPR · ISO 27001 · SOC 2" }
```
::

## Projects {.closing}

A weather station built around an ESP32 — firmware, MQTT telemetry, Grafana
dashboards, 3D-printed enclosure. This CV is a side project too.

## Off the clock {.closing}

Scouting — where the hiking and camping come from. Guitar, DIY electronics and
3D printing.

## Languages {.closing}

- Portuguese (native)
- English (C1, TOEFL)
