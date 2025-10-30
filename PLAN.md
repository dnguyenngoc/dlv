# DLV – Business-Oriented Plan

## 1) Product Vision
A lightweight, self-hosted Data Lineage and Pipeline Health platform that gives engineering teams a live map of data flows, rapid incident triage, and audit-ready lineage with minimal setup.

## 2) Target Users & Buyers
- Data Platform Teams – operate pipelines, ensure reliability
- Data/Analytics Engineers – debug breaks, understand dependencies
- Compliance/Governance – audit lineage and data access
- Engineering Leadership (buyers) – reduce downtime, improve delivery speed

## 3) Core Value Propositions
- End-to-end lineage visibility across Spark, Airflow, Kafka, DBs
- Near real-time pipeline status to cut MTTR
- One place to document, annotate, and monitor data flows (dashboards)
- Easy integration, runs in your VPC/on‑prem (no data leaves your infra)

## 4) Key Use Cases
- Impact analysis: what breaks downstream if a table/job fails?
- Incident response: identify failed upstream and blast radius fast
- Change management: assess downstream before altering schemas/jobs
- Compliance & audits: prove lineage and access paths for sensitive data

## 5) Scope (MVP → v1.0)
- Auth & RBAC: Admin (full), Viewer (read-only)
- Node catalog: Spark/Airflow/DB/Kafka with connection configs
- Lineage model: nodes, edges (flows), metadata (owner, SLA, tags)
- Dashboards: drag-drop canvas to assemble/annotate flows
- Health monitoring (foundations): manual tests + simple status API
- API-first backend (FastAPI); UI follows (React Flow)

## 6) Differentiators
- Simple self-hosted deployment
- Optimized for ops speed: triage/impact-first UX
- Incremental adoption: start with top systems, expand later

## 7) KPIs & Success Metrics
- Reduced TTD/MTTR
- Lineage coverage (% pipelines/nodes captured)
- Incidents with impact analysis produced < 5 minutes
- Active dashboards and annotated nodes per team

## 8) Security & Compliance (Foundations)
- JWT auth, role-based permissions (admin/viewer)
- Single-tenant, in‑VPC deployment (Docker/Kubernetes)
- Audit logs for node/dashboard changes (post‑v1)

## 9) Packaging & Pricing (Placeholder)
- Community (self-hosted, core lineage + basic monitoring)
- Team (RBAC, alerting, API limits, priority support)
- Enterprise (SSO/SAML, audit logs, advanced SLAs, custom collectors)

## 10) Rollout Roadmap
- Phase A (Weeks 1–3)
  - Backend MVP: Auth, Users, Nodes, Lineage CRUD, seed admin
  - Swagger/OpenAPI, Docker Compose, pre-commit/ruff
  - Manual health tests (test connection) + status API
- Phase B (Weeks 4–6)
  - Dashboards (React Flow), save/load layouts
  - Basic impact analysis (up/downstream traversal)
  - Neo4j lineage storage + initial graph queries
- Phase C (Weeks 7–9)
  - Monitoring loops (Celery + Redis), periodic checks
  - WebSocket updates to UI, status panel, simple alerts
  - Owner/SLA metadata; annotations on nodes/edges
- Phase D (Weeks 10–12)
  - Hardening: auth policies, migrations, retention
  - Observability: metrics, structured logs, error budgets
  - Pilot with an internal team; feedback → iterate

## 11) Go-To-Market (Initial)
- Bottom-up adoption via self-hosted quickstart
- Templates for Spark/Airflow/DB; recipes and examples
- Case studies on MTTR reduction and safer changes

## 12) Risks & Mitigations
- Integration breadth → start with Spark, Airflow, Postgres; add Kafka later
- Data sensitivity → store metadata/lineage only, not raw data
- Ops complexity → Compose + Helm; clear SRE runbooks

## 13) Definition of Done (v1.0)
- Users can authenticate; add nodes; draw lineage; save dashboards
- Manual health checks; status visible on canvas
- Upstream/downstream impact queries
- One-command deploy; docs & examples available

## 14) Post‑v1.0 Ideas
- Advanced alerting/rule engine (SLA breaches, anomaly detection)
- Column-level lineage; dbt integration
- Data contracts and change impact simulation
- Incident timelines & postmortem export
