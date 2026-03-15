const randomConfirmation = () => `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

// PKG12345678 — found and redirectable (alice)
// PKG87654321 — not found (bob)
// PKG11111111 — found but redirect fails (carol)
export const checkPackage = async (packageid) => {
    let result;
    if (packageid === "PKG12345678") {
        result = { status: "in_transit", packageid, location: "Warsaw Hub", estimatedDelivery: "2026-03-17" };
    } else if (packageid === "PKG87654321") {
        result = { status: "error", message: "Package not found or tracking unavailable." };
    } else if (packageid === "PKG11111111") {
        result = { status: "in_transit", packageid, location: "Krakow Depot", estimatedDelivery: "2026-03-18" };
    } else {
        result = { status: "error", message: "Unknown package." };
    }
    return result;
};

export const redirectPackage = async (packageid, destination, code) => {
    let result;
    if (packageid === "PKG12345678") {
        result = { status: "redirected", packageid, destination, confirmation: randomConfirmation() };
    } else if (packageid === "PKG11111111") {
        result = { status: "error", message: "Invalid security code or package cannot be redirected." };
    } else {
        result = { status: "error", message: "Package not eligible for redirection." };
    }
    return result;
};
