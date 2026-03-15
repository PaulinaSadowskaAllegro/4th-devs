import { resolveModelForProvider } from "../config.js";
import { PROXY_PORT, server } from "./proxy.js";

const PACKAGES_API = `http://localhost:${PROXY_PORT}/api/packages`;
const API_KEY = process.env.AI_DEVS_API_KEY;

const checkPackage = async (packageid) => {
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "check", packageid }),
    });
    return res.json();
};

const redirectPackage = async (packageid, destination, code) => {
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "redirect", packageid, destination, code }),
    });
    return res.json();
};

const main = async () => {
   server.listen(PROXY_PORT, () => {
      console.log(`[proxy] Listening on http://localhost:${PROXY_PORT}/api/packages`);
    });
    
    const packageId = "PKG12345678";
/*
    console.log("Checking package status...");
    const status = await checkPackage(packageId);
    console.log("Status:", JSON.stringify(status, null, 2));*/

    const code = "security-code-1234"; 
    const destination = "PWR3847PL";
    console.log("Redirecting package...");
    const redirect = await redirectPackage(packageId, destination, code);
    console.log("Redirect confirmation:", JSON.stringify(redirect, null, 2));
};

main().catch(console.error);
