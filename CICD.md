# CI/CD Pipeline Documentation

## Overview

This document outlines the Continuous Integration/Continuous Deployment (CI/CD) pipeline. The pipeline is
designed to automate testing, building, and deployment processes, ensuring that updates are seamlessly integrated and
delivered to the production environment.

## Pipeline Workflow

The CI/CD pipeline is triggered by various events and is divided into distinct jobs to manage the build and deployment
process efficiently.

### Trigger Events

- **Develop Branch Updates**: The pipeline is triggered on push or pull request events targeting the `develop` branch
  for continuous integration.
- **Main Branch Updates**: The pipeline also runs on push events to the `main` branch, facilitating continuous
  deployment.
- **Manual Triggers**: Additionally, the workflow can be manually triggered from the GitHub Actions tab, providing
  flexibility for ad-hoc operations.

### Jobs

#### 1. Continuous Integration

- **Build and Test**: Upon a trigger, the project is built, and automated tests are run to ensure stability and
  functionality.

#### 2. Continuous Deployment

- **Docker Push (Production)**: If the trigger is a push to the `main` branch or a manual dispatch, the pipeline builds
  a Docker image and pushes it to Docker Hub.
    - **Environment**: Self-hosted runner.
    - **Steps**:
        1. Checkout the repository.
        2. Login to Docker Hub.
        3. Set up Docker Buildx.
        4. Build and push the Docker image to Docker Hub.

- **Deploy to Production**: After the Docker image is pushed, the production environment is updated with the latest
  version.
    - **Environment**: Ubuntu-latest.
    - **Dependencies**: Needs successful completion of the Docker Push job.
    - **Steps**:
        1. SSH into the production server.
        2. Login to Docker on the server.
        3. Pull the latest Docker image.
        4. Restart and update Docker containers to deploy the new version.

## Configuration

### Secrets

The pipeline uses the following GitHub secrets for authentication and authorization:

- `DOCKERHUB_USERNAME`: Docker Hub username.
- `DOCKERHUB_TOKEN`: Docker Hub token or password.
- `IP_AIETAL_PROD`: IP address of the production server.
- `USER_AIETAL`: Username for SSH access to the production server.
- `SSH_PRIVATE_KEY_CD_AIETAL`: SSH private key for secure connection to the production server.

Ensure these secrets are configured in your GitHub repository before running the pipeline.

### Dockerfile

Ensure your project contains a `Dockerfile` at the root, specifying how the Docker image for your application should be
built.

### Docker Compose

For deployment, a `docker-compose.yml` file should be present in the specified directory on the production
server (`/var/www/myproject-docker/`), defining how your application's containers should be run.

## Execution

The pipeline is defined in a YAML file within the `.github/workflows/` directory of your repository. You can trigger the
pipeline by pushing to the `develop` or `main` branch, making a pull request to `develop`, or manually through the
GitHub Actions tab.
