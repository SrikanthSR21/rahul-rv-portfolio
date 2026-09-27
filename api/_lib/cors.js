const config = require("./config");

function applyCors(req, res) {
  const allowed = config.SITE_URL();
  const origin = req.headers.origin;
  if (allowed === "*" || !origin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else if (origin === allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Returns true if the request was a preflight OPTIONS request and has been handled.
function handlePreflight(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { applyCors, handlePreflight };
