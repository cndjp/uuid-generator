const { events, Job, Group } = require("brigadier");

events.on("exec", function(e, project) {
	  console.log("Hello world");
})
