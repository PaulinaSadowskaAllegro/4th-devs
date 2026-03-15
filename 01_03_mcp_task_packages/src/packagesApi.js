const PACKAGES_API = "https://hub.ag3nts.org/api/packages";
const API_KEY = process.env.AI_DEVS_API_KEY;

export const checkPackage = async (packageid) => {
    console.log("[🛠️ tool] Check status request:", JSON.stringify({ action: "check", packageid }, null, 2));
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "check", packageid }),
    });
    const data = await res.json();
    console.log("[🛠️ tool] Check status response:", JSON.stringify(data, null, 2));
    return data;
};

export const redirectPackage = async (packageid, destination, code) => {
    console.log("[🛠️ tool] Redirect request:", JSON.stringify({ action: "redirect", packageid, destination }, null, 2));
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "redirect", packageid, destination, code }),
    });
    const data = await res.json();
    console.log("[🛠️ tool] Redirect response:", JSON.stringify(data, null, 2));
    return data;
};
