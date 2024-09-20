const express = require("express");
const app = express();
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Import FingerprintJS Pro Server API client
const { FingerprintJsServerApiClient, Region } = require('@fingerprintjs/fingerprintjs-pro-server-api');

// Initialize the FingerprintJS client
const client = new FingerprintJsServerApiClient({
  apiKey: 'Z1IlqUwZASRlGEkjAVv9',
  region: Region.Global,
});

let visitors = [];

// Function to fetch visitor history and populate the visitors array
const initializeVisitors = async () => {
  try {
    console.log("Fetching visitor history from FingerprintJS...");

    // Fetch all visitors' history from FingerprintJS (adjust the method based on your API needs)
    const visitorHistory = await client.getVisitorHistory('<visitorId>');  // Adjust this API call based on your specific implementation

    // Populate visitors array based on fetched visitor data
    if (visitorHistory && visitorHistory.visitors) {
      visitors = visitorHistory.visitors.map(visitor => ({
        visitorid: visitor.visitorId
      }));
    }
    console.log("Visitors array initialized with FingerprintJS data:", visitors);
  } catch (error) {
    console.error("Error initializing visitors from FingerprintJS:", error);
  }
};

// Call the initialization function when the server starts
initializeVisitors();

app.get("/api/visitors", (req, res) => {
  res.send(visitors);
});

app.get("/api/visitors/:visitorid", (req, res) => {
  console.info(req.params);
  const visitor = visitors.find((c) => c.visitorid === req.params.visitorid);
  if (!visitor) {
    return res
      .status(404)
      .send('<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>');
  }

  // Fetch visitor history from FingerprintJS
  client.getVisitorHistory(req.params.visitorid)
    .then((visitorHistory) => {
      console.log(visitorHistory);
      res.send({
        visitor,
        fingerprintHistory: visitorHistory
      });
    })
    .catch((err) => {
      console.error("Error fetching visitor history:", err);
      res.status(500).send("Error fetching visitor history.");
    });
});

//CREATE Request Handler
app.post("/api/visitors", (req, res) => {
  const { error } = validateVisitorID(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const visitor = {
    visitorid: req.body.visitorid,
  };
  visitors.push(visitor);
  res.send(visitor);
});

//UPDATE Request Handler
app.put("/api/visitors/:visitorid", (req, res) => {
  const visitor = visitors.find((c) => c.visitorid === req.params.visitorid);
  if (!visitor) {
    return res
      .status(404)
      .send('<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>');
  }

  const { error } = validateVisitorID(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  visitor.visitorid = req.body.visitorid;
  res.send(visitor);
});

//DELETE Request Handler
app.delete("/api/visitors/:visitorid", (req, res) => {
  const visitor = visitors.find((c) => c.visitorid === req.params.visitorid);
  if (!visitor) {
    return res
      .status(404)
      .send('<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>');
  }

  const index = visitors.indexOf(visitor);
  visitors.splice(index, 1);
  res.send(visitor);
});

function validateVisitorID(book) {
  return true;
}

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Listening on port ${port}..`));

// Example: Get a specific identification event
app.get('/api/visitors/:visitorid/events/:requestid', (req, res) => {
  const { requestid } = req.params;

  client.getEvent(requestid)
    .then((event) => {
      console.log(event);
      res.send(event);
    })
    .catch((err) => {
      console.error("Error fetching event:", err);
      res.status(500).send("Error fetching event.");
    });
});
