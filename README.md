# CI/CD Infrastructure with GitLab Runner

A production-style CI/CD project built on AWS free tier. Every push to `main` automatically builds a Docker image, deploys it to EC2, runs a health check, and rolls back if the deployment fails.

---

## What this does:

Push code → GitLab pipeline triggers → Docker image builds on EC2 → container deploys → health check runs → if it fails, the previous version restores automatically.

The entire flow runs on a self-hosted GitLab Runner on a t3.micro EC2 instance. No managed services, no extra cost.

---

## Stack

- **GitLab CI/CD** — pipeline definition and trigger
- **GitLab Runner** — self-hosted on EC2, shell executor
- **Docker** — each deploy builds a new image tagged with the commit SHA
- **Node.js** — the app itself (no dependencies, just the built-in `http` module)
- **AWS EC2** — t3.micro, Ubuntu 22.04, free tier
- **AWS CloudWatch** — CPU alarm with SNS email notification

---

## Pipeline stages

```
build → deploy
```

**build** — runs `docker build` and tags the image with `$CI_COMMIT_SHORT_SHA`

**deploy** — stops the old container, starts the new one on port 80, waits 3 seconds, then hits `/health`. If the health check fails, it finds the previous image by SHA and restores it before exiting with a non-zero code.

The pipeline only runs on the `ec2` tagged runner, which is the EC2 instance itself. GitLab's shared runners are not used.

---

## Auto-rollback

The deploy stage has a built-in rollback:

```yaml
- |
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

If the new container doesn't respond on `/health` within 3 seconds, the pipeline automatically restores the last known good image and marks the job as failed so you know something went wrong. The app stays live throughout.

This was tested intentionally — a crash was introduced, pushed, and the rollback fired correctly in the pipeline logs.

---

## Health check endpoint

```
GET /health → { "status": "healthy" }
```

The pipeline hits this after every deploy. It's also available publicly at `http://<ec2-ip>/health` for external monitoring.

---

## Monitoring

A CloudWatch alarm monitors CPU utilization on the EC2 instance. If average CPU exceeds 70% over a 5-minute window, it fires an SNS notification to email. This catches runaway containers from bad deployments before they affect users.

---

## Versioning and rollback

Every Docker image is tagged with the Git commit SHA:

```
myapp:2b31ce94
myapp:e31ad61c
```

To manually roll back to any previous version:

```bash
docker stop myapp
docker rm myapp
docker run -d -p 80:3000 --name myapp myapp:<commit-sha>
```

---

## Screenshots

| What | File |
|---|---|
| GitLab pipeline passing | `build pipeline.png` |
| App live in browser (v1) | `start page v1.png` |
| App live in browser (v2) | `start page v2.png` |
| Health check response | `health status.png` |
| Auto-rollback in pipeline logs | `auto rollback.png` |
| Manual rollback command | `rollback command terminal.png` |
| CloudWatch alarm | `alarm.png` |

---

## Infrastructure

```
Local machine
    ↓ git push origin main
GitLab repository
    ↓ webhook trigger
GitLab Runner (EC2 t3.micro)
    ↓ docker build
    ↓ docker run -p 80:3000
    ↓ curl /health
EC2 public IP → live app
```

Single instance handles both the runner and the app. Works within AWS free tier limits (750 hours/month on t3.micro).
