# 🚀 Production-Grade CI/CD Pipeline with GitLab Runner on AWS

##  Overview
Built a production-grade CI/CD pipeline using GitLab CI/CD with a self-hosted runner on AWS EC2. The system automates build, deployment, health checks, and rollback, ensuring reliability and zero-downtime deployments.

---

##  Tech Stack
- GitLab CI/CD
- Docker
- AWS EC2
- AWS CloudWatch & SNS
- Linux

---

##  Architecture
![Architecture](architecture diagram.png)

---

##  Pipeline Flow
![Pipeline](build pipeline.png)

- Code pushed to GitLab triggers pipeline
- Build stage creates Docker image tagged with commit SHA
- Deploy stage updates application container on EC2
- Health checks validate deployment
- Automatic rollback triggered on failure

---

##  Rollback Mechanism
![Auto Rollback](auto rollback.png)
![Manual Rollback](rollback command terminal.png)

- One-command rollback to previous stable version
- Automatic rollback on failed health checks
- Versioned Docker images enable quick recovery

---

##  Monitoring & Alerts
![Health](health status.png)

- AWS CloudWatch monitors CPU and system metrics
- SNS alerts notify on threshold breaches
- Ensures high availability and quick incident response

---

##  Application UI
![UI v1](start page v1.png)
![UI v2](start page v2.png)


---

##  Key Highlights
- Automated end-to-end CI/CD pipeline
- Self-hosted GitLab Runner for full control
- Zero-downtime deployments with rollback
- Production-level monitoring and alerting
- Version-controlled Docker deployments

---

## 📈 Impact
Designed a reliable and scalable deployment system that mimics real-world DevOps practices, focusing on automation, observability, and failure recovery.
