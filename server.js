const express = require("express");
const app = express();
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const visitors = [
    { visitorid: "12345", accountid: "12345" },
];

//READ Request Handlers

app.get("/api/visitors", (req, res) => {
    res.send(visitors);
});

app.get("/api/visitors/:visitorid", (req, res) => {
    console.info(req.params)
    const visitor = visitors.find((c) => c.visitorid === req.params.visitorid);
    console.info(visitor)
    if (!visitor)
        res
            .status(404)
            .send(
                '<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>'
            );
    res.send(visitor);
});

//CREATE Request Handler
app.post("/api/visitors", (req, res) => {
    console.info("req body="+req.body)
    const { error } = validateVisitorID(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    console.info(req.body);
    const visitor = {
        visitorid: req.body.visitorid,
        accountid: req.body.accountid,
    };
    visitors.push(visitor);
    res.send(visitor);
});

//UPDATE Request Handler
app.put("/api/visitors/:visitorid", (req, res) => {
    const visitor = visitors.find((c) => c.visitorid === parseInt(req.params.visitorid));
    if (!visitor)
        res
            .status(404)
            .send(
                '<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>'
            );

    const { error } = validateVisitorID(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    visitor.accountid = req.body.accountid;
    res.send(visitor);
});

//DELETE Request Handler
app.delete("/api/visitors/:visitorid", (req, res) => {
    const visitor = visitors.find((c) => c.visitorid === parseInt(req.params.visitorid));
    if (!visitor)
        res
            .status(404)
            .send(
                '<h2 style="font-family: Malgun Gothic; color: darkred;">ID not found</h2>'
            );

    const index = visitors.indexOf(visitor);
    visitors.splice(index, 1);

    res.send(visitor);
});

function validateVisitorID(book) {
    return true
}

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`Listening on port ${port}..`));
