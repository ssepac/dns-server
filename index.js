require("dotenv").config({path: `${__dirname}/.env`});
const http = require("http");
const fs = require("fs");
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/server/location") {
    //Ensure authorization
    if (!assertAuth(req, res)) return;

    if (req.method.toLowerCase() === "get") {
      fs.readFile("backup-server.txt", { encoding: "utf8" }, (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: true, errorObject: err }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: false, result: { url: data } }));
      });
    } else if (req.method.toLowerCase() === "post") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const { url } = JSON.parse(body)
          fs.writeFile(
            "backup-server.txt",
            url,
            { encoding: "utf8" },
            (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: true, errorObject: err }));
                return;
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end();
            }
          );
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: true, errorObject: err }));
        }
      });
    }
  } else if (req.url === "/health" && req.method.toLowerCase() === "get") {
    console.log("Request for health check received.");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end("Online.");
  }
});

server.listen(PORT, process.env.ip, () => {
  console.log(`Server listening on http://${process.env.ip}:${PORT}/ ...`);
});

/** Returns true if authenticated. */
const assertAuth = (req, res) => {
  if (req.headers["pass"] != process.env.pass) {
    console.log("Rejected request because of bad password.");
    res.writeHead(401, { "Content-Type": "text/plain" });
    res.end("Invalid password provided in header.");
    return false;
  }
  return true;
};
