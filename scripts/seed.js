const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Tenant = require("@/models/tenant").default;
const User = require("@/models/user").default;
const Note = require("@/models/note").default;

async function main() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error("Set MONGODB_URI in .env");

    await mongoose.connect(MONGODB_URI, {});

    const pw = "password";
    const pwHash = await bcrypt.hash(pw, 10);

    const acme = await Tenant.findOneAndUpdate(
        { slug: "acme" },
        { slug: "acme", name: "Acme", plan: "free" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const globex = await Tenant.findOneAndUpdate(
        { slug: "globex" },
        { slug: "globex", name: "Globex", plan: "free" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const users = [
        { email: "admin@acme.test", role: "admin", tenantId: acme._id },
        { email: "user@acme.test", role: "member", tenantId: acme._id },
        { email: "admin@globex.test", role: "admin", tenantId: globex._id },
        { email: "user@globex.test", role: "member", tenantId: globex._id }
    ];

    for (const u of users) {
        await User.findOneAndUpdate(
        { email: u.email },
        { email: u.email, role: u.role, tenantId: u.tenantId, passwordHash: pwHash },
        { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    // Optionally create one seed note for each tenant:
    const acmeUser = await User.findOne({ email: "admin@acme.test" });
    const globexUser = await User.findOne({ email: "admin@globex.test" });

    await Note.findOneAndUpdate(
        { title: "Welcome - Acme" },
        { title: "Welcome - Acme", content: "This is the Acme tenant starter note.", tenantId: acme._id, createdBy: acmeUser._id },
        { upsert: true }
    );

    await Note.findOneAndUpdate(
        { title: "Welcome - Globex" },
        { title: "Welcome - Globex", content: "This is the Globex tenant starter note.", tenantId: globex._id, createdBy: globexUser._id },
        { upsert: true }
    );

    console.log("Seeded tenants and users. All test accounts password: password");
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
