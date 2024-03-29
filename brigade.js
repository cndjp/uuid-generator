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
