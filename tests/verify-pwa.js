const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

let failures = 0;
function check(name, condition) {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}`);
}

const index = read("index.html");
const sw = read("sw.js");
const components = read("app/components.jsx");
const app = read("app/app.jsx");
const store = read("app/store.js");
const settings = read("app/settings.jsx");
const travel = exists("app/travel.jsx") ? read("app/travel.jsx") : "";

check("Travel screen file exists", exists("app/travel.jsx"));
check("index loads travel screen before app root", /app\/travel\.jsx/.test(index) && index.indexOf("app/travel.jsx") < index.indexOf("app/app.jsx"));
check("service worker caches travel screen", /app\/travel\.jsx/.test(sw));
check("Travel tab is registered", /id:\s*["']travel["']/.test(components) && /label:\s*["']Travel["']/.test(components));
check("App routes TravelScreen", /tab === ["']travel["']/.test(app) && /<TravelScreen\b/.test(app));
check("Store exposes travel state", /getTravel/.test(store) && /setTravel/.test(store));
check("Store exposes map link place add", /addPlaceFromMapsLink/.test(store));
check("Store exposes JSON backup and restore", /toJSON/.test(store) && /restoreJSON/.test(store));
check("Settings exposes JSON backup controls", /Export JSON/.test(settings) && /Restore JSON/.test(settings));
check("Travel screen has required sections", /Air France/.test(travel) && /Emergency/.test(travel) && /Offline Maps/.test(travel) && /Readiness/.test(travel) && /Google Maps/.test(travel));
check("Travel screen avoids real offline tile storage claims", !/download tiles|tile storage|leaflet\.offline/i.test(travel));

if (failures) {
  console.error(`\n${failures} verification check(s) failed.`);
  process.exit(1);
}

console.log("\nAll static PWA verification checks passed.");
