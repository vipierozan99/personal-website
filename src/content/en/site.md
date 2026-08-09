---
locale: en
role: Technical lead · Berlin
subtitle: Backend and systems engineer in Berlin.
location: Berlin, since 2022.
before: "Before: Florianópolis, Aachen."
person:
  name: Victor Pierozan
  email: victorpierozan@gmail.com
  github:
    label: github.com/vipierozan99
    href: https://github.com/vipierozan99
  paper: https://ieeexplore.ieee.org/document/9965059
---

Since 2022 I've been at Noah Labs building cardiac medical devices, now as
technical lead with a team of four across backend, web and mobile. In that time
I've rebuilt the platform's backend, its clinician web application, and its
patient mobile app, and designed and shipped Vox, an API that detects
heart-failure deterioration from a patient's voice, from an empty repository to
production. Along the way: Kafka (Redpanda) streaming for device telemetry,
Postgres-backed job queues, webhook delivery with real ordering guarantees,
integrations with four cardiac implant vendors, and the IEC 62304, GDPR and
SOC 2 apparatus that comes with clinical software. Before that, mechatronics
engineering at UFSC in Brazil with a year at RWTH Aachen, and a paper on
[detecting engine knock from automotive ECU data](https://ieeexplore.ieee.org/document/9965059).

> What I care about is software that works, correctly and all the time, and
> that's also comfortable to build in and fast enough to respect the hardware
> it runs on. Those pull in the same direction far more often than people
> assume.

Things I'd rather be talking about. If any of it is your thing too, come find
me.

::project{#vox title="Vox" meta="Noah Labs" link="Read more →" year=2024 href="https://noah-labs.com" stack="Python · Kafka · Postgres · Signal processing"}
An API that detects heart-failure deterioration from a patient's voice.

Designed and shipped from an empty repository to production: audio capture on
the patient app, a signal-processing pipeline behind an API, and a
clinician-facing result surface. The interesting parts were the guarantees —
every recording accounted for, every result attributable, and the IEC 62304
paperwork produced as a by-product of how the system was built rather than
bolted on afterwards.
::

::project{#cv title="Curriculum vitæ" meta="React · Tailwind" link="Open the CV →" year=2025 href="/cv" stack="React · Tailwind · Print CSS"}
A CV that is a website and prints as a document.

One source of truth that renders as a website and prints as a real document —
page breaks, print-only chrome removal, no scaled-down screenshot of a page.
Deployed as static files.
::

::project{#site title="This site" meta="React · Vite" link="Source →" year=2026 href="https://github.com/vipierozan99" stack="React · Vite · Tailwind"}
Prerendered to static HTML, hydrated on load. No analytics.

No analytics, no cookie banner, because there is nothing to consent to.
Prerendered to static HTML at build time, so it reads fine with JavaScript
off — scripts only add the theme toggle, the cross-highlighting and the
reading controls.
::

::project{#knock title="Engine knock detection" meta="IEEE · UFSC" link="Read the paper ↗" year=2022 href="https://ieeexplore.ieee.org/document/9965059" stack="Python · Signal processing · Embedded"}
Detecting engine knock from automotive ECU data.

Published out of UFSC: detecting engine knock from data an ECU already emits,
without adding a sensor. Signal processing on cheap, noisy, real-world
automotive data — the first time I had to care about what the hardware could
actually give me.
::

::topic{#delivery-guarantees label="Transactional and delivery guarantees" projects="vox"}
Exactly-once is a lie you can still engineer around. Outbox tables, idempotency
keys, and knowing which of the two you actually need.
::

::topic{#consistency label="Consistency guarantees in distributed systems" projects="vox"}
Linearizable, causal, eventual — picking deliberately instead of inheriting
whatever the database gave you.
::

::topic{#local-first label="Local-first software design" projects="cv"}
The network is an optimisation, not a prerequisite. Sync as a property of the
data model.
::

::topic{#event-driven label="Event-driven architectures and backpressure" projects="vox"}
Kafka and friends. What happens when the consumer is slower than the producer,
which is always.
::

::topic{#zero-downtime label="Zero-downtime deployments and schema evolution" projects="vox"}
Expand, migrate, contract. Two versions of the code reading the same rows
without either noticing.
::

::topic{#reliability label="Reliability through design" projects="vox · site"}
Systems that don't exist shouldn't have bugs. The cheapest component is the one
you deleted.
::

::topic{#type-systems label="Type system expressiveness and correctness guarantees"}
Making the illegal states unrepresentable, and knowing when the type gymnastics
stop paying.
::

::topic{#ergonomics label="Developer ergonomics and tooling you can reason about" projects="cv · site"}
Build systems you can explain. Errors that say what to do next.
::

::topic{#perf-abstractions label="Performance implications of language abstractions" projects="site"}
What that iterator actually compiles to, and whether it matters here.
::

::topic{#cpu-cache label="CPU cache behaviour and memory-efficient code patterns" projects="knock"}
Data layout beats algorithmic cleverness more often than is comfortable.
::

::topic{#columnar label="Columnar databases, query optimisation, parallel data processing"}
Vectorised execution, predicate pushdown, and reading query plans for fun.
::

::topic{#complexity label="Algorithmic complexity and scalability limits" projects="knock"}
Where the curve bends, and what the constant factor is doing in the meantime.
::

::topic{#agent-evals label="Agent evaluation and failure modes" projects="vox"}
How you know an agent is working, and what it looks like when it quietly isn't.
::

::topic{#agent-context label="Context management and memory architectures for agents"}
What to keep, what to summarise, what to forget on purpose.
::

::topic{#codesign label="Hardware-software codesign" projects="knock"}
Left over from mechatronics. Software that knows what it's running on.
::

::person{#one name="First Last" subject="Databases"}
Five lines of why you read them, in your own voice. Enough room to name the
specific argument that changed your mind, say where you disagree, and point at
the one piece someone should start with. Anything shorter is a directory entry.

[site ↗](#) [the post ↗](#)
::

::person{#two name="First Last" subject="Distributed systems"}
Second entry. The left band is a fixed width so the names line up down the page
and can be scanned without reading; on a narrow window the band drops above the
paragraph and the card becomes a stack.

[site ↗](#)
::

::person{#three name="First Last" subject="Local-first"}
Third entry. Placeholder until the real list is ready.

[site ↗](#) [talk ↗](#)
::

::person{#four name="First Last" subject="Agents"}
Fourth entry. Placeholder.

[site ↗](#)
::
