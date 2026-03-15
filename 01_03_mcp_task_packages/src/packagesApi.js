const PACKAGES_API = "https://hub.ag3nts.org/api/packages";
const API_KEY = process.env.AI_DEVS_API_KEY;

export const checkPackage = async (packageid) => {
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "check", packageid }),
    });
    const data = await res.json();
    return data;
};

export const redirectPackage = async (packageid, destination, code) => {
    const res = await fetch(PACKAGES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: API_KEY, action: "redirect", packageid, destination, code }),
    });
    const data = await res.json();
    return data;
};
