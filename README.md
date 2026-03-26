# 🚀 GitLab DevOps Demo – CI/CD Pipeline on AWS

[![GitLab CI](https://img.shields.io/badge/GitLab-CI%2FCD-orange)](https://gitlab.com)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue)](https://docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2%20t3.micro-yellow)](https://aws.amazon.com)
[![Runner](https://img.shields.io/badge/Runner-Self--Hosted-brightgreen)](https://docs.gitlab.com/runner/)
[![Status](https://img.shields.io/badge/Pipeline-PASSING-brightgreen)]()

---

## Project Overview

This project demonstrates a production-style CI/CD pipeline built entirely on AWS free tier. Every push to `main` automatically builds a Docker image on a self-hosted GitLab Runner, deploys it to EC2, runs a health check, and rolls back to the previous version if the deployment fails.

The entire setup runs on a single **t3.micro EC2 instance** — no managed services, no extra cost. The same machine runs the GitLab Runner and hosts the live application.

The pipeline handles:

- Automated Docker image build on every push
- Version tagging using Git commit SHA
- Post-deploy health check via HTTP
- Automatic rollback if health check fails
- CloudWatch CPU monitoring with SNS email alerts

---

## Project Structure

```
gitlab-devops-demo/
│
├── index.js              # Node.js app with / and /health endpoints
├── Dockerfile            # Container definition
├── .gitlab-ci.yml        # Pipeline stages: build → deploy
├── screenshots/          # Proof screenshots
└── README.md             # Project documentation
```

---

## Architecture Diagram

![Architecture](screenshots/architecture.png)

---

## Architecture Breakdown

### AWS Region
`us-east-1`

### EC2 Instance (t3.micro)

Single instance running Ubuntu 22.04, handling two responsibilities:

- **GitLab Runner** — receives pipeline jobs from GitLab and executes them locally
- **Docker Engine** — builds images and runs the Node.js container on port 80

**Security Group:**
- Port 22 (SSH) — restricted to developer IP only
- Port 80 (HTTP) — open to public
- Port 3000 — open to public (direct container access)

### GitLab CI/CD

Pipeline defined in `.gitlab-ci.yml` with two stages:

```yaml
stages:
  - build
  - deploy
```

**build** — runs `docker build` and tags the image with `$CI_COMMIT_SHORT_SHA`

**deploy** — stops the old container, starts the new one, waits 3 seconds, then hits `/health`. If the health check fails, the pipeline finds the previous image by SHA, restores it, and exits with a non-zero code.

### CloudWatch Monitoring

CPU utilization alarm on the EC2 instance. Fires an SNS email notification if average CPU exceeds 70% over a 5-minute window.

---

## Pipeline Stages

### Build

```bash
docker build -t myapp:$CI_COMMIT_SHORT_SHA .
```

Each image is permanently tagged with the Git commit SHA. This creates a full version history of every deployment and makes rollback a single command.

### Deploy with Auto-Rollback

```bash
docker stop myapp || true
docker rm myapp || true
docker run -d -p 80:3000 --name myapp myapp:$CI_COMMIT_SHORT_SHA
sleep 3
if ! curl -f http://localhost/health; then
  echo "Health check failed - rolling back..."
  docker stop myapp
  docker rm myapp
  PREV=$(docker images myapp --format "{{.Tag}}" | sed -n '2p')
  docker run -d -p 80:3000 --name myapp myapp:$PREV
  echo "Rolled back to $PREV"
  exit 1
fi
```

The `|| true` on stop and rm means the pipeline doesn't fail if nothing is running yet — handles the first deployment cleanly.

---

## Health Check

```
GET /health → { "status": "healthy" }
```

The pipeline hits this endpoint after every deploy. If the container didn't start, the curl fails, rollback fires, and the pipeline marks the job red. The app stays live on the old version while you fix the new one.

This was tested by intentionally crashing the app and observing the rollback in the pipeline logs.

---

## Versioning and Manual Rollback

```bash
# List all versioned images
docker images

# Roll back to any previous version
docker stop myapp
docker rm myapp
docker run -d -p 80:3000 --name myapp myapp:<commit-sha>
```

---

## Project Screenshots

![Build Pipeline](screenshots/build%20pipeline.png)

GitLab pipeline passing — build and deploy stages both green.

&nbsp;

![App v1](screenshots/start%20page%20v1.png)

Live app in browser — version 1.

&nbsp;

![App v2](screenshots/start%20page%20v2.png)

Live app after redeployment — version 2, no downtime.

&nbsp;

![Health Check](screenshots/health%20status.png)

`/health` endpoint returning `{"status":"healthy"}`.

&nbsp;

![Auto Rollback](screenshots/auto%20rollback.png)

Pipeline log showing automatic rollback after intentional crash — health check failure detected, previous image restored.

&nbsp;

![Rollback Terminal](screenshots/rollback%20command%20terminal.png)

Manual rollback via `docker images` and commit SHA.

&nbsp;

![CloudWatch Alarm](screenshots/alarm.png)

CloudWatch CPU alarm active at 70% threshold with SNS notification configured.

---

## What This Project Demonstrates

- Self-hosted CI/CD with GitLab Runner on EC2
- Docker-based versioned deployments
- Automated health checks post-deploy
- Rollback strategy using commit SHA image tagging
- CloudWatch monitoring and alerting
- Dual-remote Git workflow (GitLab pipeline + GitHub portfolio)
- Free tier AWS infrastructure that mirrors production thinking

---

## Conclusion

This project pushed me to understand CI/CD not just conceptually but operationally — dealing with Docker permission errors, runner registration issues, health check failures, and rollback logic all taught me more than any tutorial would.

The part I found most valuable was building the rollback mechanism. It forced me to think about what happens after a deployment, not just during it. A pipeline that deploys successfully is useful — a pipeline that recovers automatically from a bad deploy is closer to how real systems work.

Setting up CloudWatch on top reinforced that deployment and monitoring are two sides of the same responsibility. You don't fully own a deployment until you know how you'll find out when it breaks.

This project reflects the same mindset I aim to bring to backend and DevOps work: automate the repetitive, handle failure explicitly, and build systems you can reason about when something goes wrong.
