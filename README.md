# uuid-generator
Test bridgate for cndt at the cndjp presentation

# Bridgate overview
![result](https://nvisium.com/articles/2017/2017-11-07-event-driven-kubernetes-security-bringing-in-the-brigade/brigade-architecture.png)

# Usage

## 0. Install helm & brig command

```shell
# Install helm command
$ wget https://get.helm.sh/helm-v2.14.2-linux-amd64.tar.gz
$ tar xvfz helm-v2.14.2-linux-amd64.tar.gz
$ sudo mv helm /usr/local/bin/

# Install brid command
$ wget https://github.com/brigadecore/brigade/releases/download/v1.1.0/brig-linux-amd64
$ chmod a+x brig-linux-amd64
$ sudo mv brig-linux-amd64 /usr/local/bin/brig
```

## 1. Install brigade your cluster

```shell
$ helm repo add brigade https://brigadecore.github.io/charts
$ helm install brigade/brigade --name brigade-server
$ helm upgrade brigade-server brigade/brigade -f brigade-server-values.yaml
```

## 2. Setup Github

### 2-1. Setup Github Repo

See https://docs.brigade.sh/intro/tutorial03/#configuring-github

*Test: Developer settings -> GitHub Apps -> Edit -> Advanced -> Redeliver*

### 2-2. Edit Github setting

```yaml
# mv brigade-github-app-values.exampleyaml  brigade-github-app-values.yaml

github:
  ## The x509 PEM-formatted keyfile GitHub issued for you App.
  key: |
     -----BEGIN RSA PRIVATE KEY-----
     FILL YOUR PROVATE KEY
...
     -----END RSA PRIVATE KEY-----
...
  appID:  FILL YOUR GITHUB APP ID
...
```

### 2-3. Deploy Github gateway

```yaml
$ helm install -n gh-app brigade/brigade-github-app -f brigade-github-app-values.yaml
```

## 3. Deploy CI/CD Project

```shell
$ brig project create
? VCS or no-VCS project? VCS
? Project Name cndjp/uuid-generator
? Full repository name github.com/cndjp/uuid-generator
? Clone URL (https://github.com/your/repo.git) https://github.com/cndjp/uuid-generator.git
? Add secrets? No
Auto-generated a Shared Secret: "..."
? Configure GitHub Access? No
? Configure advanced options No
Project ID: brigade-...
```

## 4. Check brigade.js & Run!!

brigade.js
```js
const { events, Job } = require("brigadier");

// run event
events.on("push", function(e, project) {
  console.log("received push for commit " + e.revision.commit)

  // Create a new job
  var testRunner = new Job("test-runner")

  // We want our job to run the stock Docker Python 3 image
  testRunner.image = "python:3"

  // Now we want it to run these commands in order:
  testRunner.tasks = [
    "cd /src/app",
    "pip install -r requirements.txt",
    "cd /src/",
    "python setup.py test"
  ]

  // Display logs from the job Pod
  testRunner.streamLogs = true;

  // We're done configuring, so we run the job
  testRunner.run()
})
```

```shell
$ kubectl get pod
NAME                                                 READY   STATUS      RESTARTS   AGE
brigade-server-brigade-api-854b587f95-ncnjv          1/1     Running     0          4h
brigade-server-brigade-ctrl-54474695fb-9swx8         1/1     Running     0          4h
brigade-server-brigade-vacuum-1563166800-bxc9r       0/1     Completed   0          4h
brigade-server-kashti-9786d69b8-d589c                1/1     Running     0          4h
brigade-worker-01dftdw66g04tfxzbscfctqjgp            0/1     Completed   0          12s # <-This is pipeline worker!!
gh-app-brigade-github-app-c4f9c9fbc-zgtxr            1/1     Running     0          4m
```
