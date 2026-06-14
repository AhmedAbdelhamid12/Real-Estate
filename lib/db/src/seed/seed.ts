import { db, usersTable, rolePermissionsTable, permissionsTable, projectsTable, leadsTable, leadActivitiesTable, clientsTable, notificationsTable } from "../index.js";
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, PERMISSION_LABELS } from "@workspace/permissions";
import bcrypt from "bcryptjs";
import { eq, inArray } from "drizzle-orm";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

export async function seed() {
  console.log("🌱 Seeding database...");

  const defaultPassword = await hashPassword("Test1234!");

  // ── 1. USERS ─────────────────────────────────────────────────────────────
  const ceoEmail = process.env["CEO_EMAIL"] ?? "ceo@propos.app";
  const ceoPassword = process.env["CEO_PASSWORD"] ?? "Change@Me2026!";

  const usersToCreate = [
    { name: "Adam Hassan",     email: ceoEmail,                  passwordHash: await hashPassword(ceoPassword), role: "ceo" as const,         title: "Chief Executive Officer" },
    { name: "Sara Al-Mansouri",email: "admin@propos.app",        passwordHash: defaultPassword,                 role: "admin" as const,       title: "Operations Manager" },
    { name: "Khalid Farooq",   email: "director@propos.app",     passwordHash: defaultPassword,                 role: "director" as const,    title: "Sales Director" },
    { name: "Lena Nasser",     email: "tl1@propos.app",          passwordHash: defaultPassword,                 role: "team_leader" as const, title: "Team Leader — North" },
    { name: "Omar Ziad",       email: "tl2@propos.app",          passwordHash: defaultPassword,                 role: "team_leader" as const, title: "Team Leader — South" },
    { name: "Maya Elias",      email: "sales1@propos.app",       passwordHash: defaultPassword,                 role: "sales" as const,       title: "Sales Agent" },
    { name: "Rami Khoury",     email: "sales2@propos.app",       passwordHash: defaultPassword,                 role: "sales" as const,       title: "Sales Agent" },
    { name: "Dina Samir",      email: "sales3@propos.app",       passwordHash: defaultPassword,                 role: "sales" as const,       title: "Sales Agent" },
    { name: "Faris Abboud",    email: "sales4@propos.app",       passwordHash: defaultPassword,                 role: "sales" as const,       title: "Sales Agent" },
    { name: "Nour Haddad",     email: "sales5@propos.app",       passwordHash: defaultPassword,                 role: "sales" as const,       title: "Sales Agent" },
  ];

  const createdUsers: { id: string; email: string; role: string }[] = [];

  for (const u of usersToCreate) {
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, u.email)).limit(1);
    if (!existing) {
      const [created] = await db.insert(usersTable).values({
        ...u,
        status: "active",
        emailVerifiedAt: new Date(),
      }).returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role });
      createdUsers.push(created);
      console.log(`  ✅ User: ${u.name} (${u.role})`);
    } else {
      createdUsers.push({ id: existing.id, email: u.email, role: u.role });
      console.log(`  ℹ️  User exists: ${u.email}`);
    }
  }

  // Assign team leaders to sales reps
  const allUsers = await db.select().from(usersTable).where(
    inArray(usersTable.email, usersToCreate.map(u => u.email))
  );
  const tl1 = allUsers.find(u => u.email === "tl1@propos.app");
  const tl2 = allUsers.find(u => u.email === "tl2@propos.app");
  const salesReps = allUsers.filter(u => u.role === "sales");

  if (tl1 && tl2 && salesReps.length > 0) {
    for (let i = 0; i < salesReps.length; i++) {
      const tl = i % 2 === 0 ? tl1 : tl2;
      await db.update(usersTable).set({ teamLeaderId: tl.id }).where(eq(usersTable.id, salesReps[i].id));
    }
  }

  // ── 2. PERMISSIONS ────────────────────────────────────────────────────────
  const permEntries = Object.entries(PERMISSION_LABELS);
  for (const [key, { label, module, description }] of permEntries) {
    await db.insert(permissionsTable).values({ key, label, module, description }).onConflictDoNothing();
  }
  console.log(`\n✅ ${permEntries.length} permissions seeded`);

  const roles = ["ceo", "admin", "director", "team_leader", "sales"] as const;
  let rpCount = 0;
  for (const role of roles) {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] ?? {};
    for (const [key, isEnabled] of Object.entries(defaults)) {
      await db.insert(rolePermissionsTable).values({ role, permissionKey: key, isEnabled }).onConflictDoNothing();
      rpCount++;
    }
  }
  console.log(`✅ ${rpCount} role permissions seeded`);

  // ── 3. PROJECTS ───────────────────────────────────────────────────────────
  const ceoUser = allUsers.find(u => u.role === "ceo");

  const projectsData = [
    { name: "Palm Residences",      ownerName: "Al Nakheel Developers",  location: "Dubai Marina, Dubai",        description: "Luxury waterfront apartments with panoramic sea views.", avgPrice: "2850000", imageUrl: null },
    { name: "Green Valley Villas",  ownerName: "Emaar Properties",       location: "Arabian Ranches, Dubai",     description: "Spacious family villas surrounded by lush greenery.", avgPrice: "4200000", imageUrl: null },
    { name: "City Tower One",       ownerName: "Damac Holdings",         location: "Business Bay, Dubai",        description: "Premium commercial and residential mixed-use tower.", avgPrice: "1450000", imageUrl: null },
    { name: "Sapphire Heights",     ownerName: "Meraas Developments",    location: "Jumeirah Village Circle",    description: "Modern mid-rise with smart home technology.", avgPrice: "980000",  imageUrl: null },
    { name: "The Cove",             ownerName: "Dubai Properties",       location: "Dubai Creek Harbour",        description: "Waterfront townhouses and apartments by the creek.", avgPrice: "1750000", imageUrl: null },
  ];

  const createdProjects: { id: string; name: string }[] = [];
  for (const p of projectsData) {
    const [existing] = await db.select({ id: projectsTable.id }).from(projectsTable).where(eq(projectsTable.name, p.name)).limit(1);
    if (!existing) {
      const [created] = await db.insert(projectsTable).values({ ...p, createdBy: ceoUser?.id ?? null, isActive: true }).returning({ id: projectsTable.id, name: projectsTable.name });
      createdProjects.push(created);
      console.log(`  ✅ Project: ${p.name}`);
    } else {
      createdProjects.push(existing);
      console.log(`  ℹ️  Project exists: ${p.name}`);
    }
  }

  if (createdProjects.length === 0) {
    console.log("No projects to seed leads against — exiting early.");
    return;
  }

  // ── 4. LEADS ──────────────────────────────────────────────────────────────
  const leadsData = [
    // NEW
    { name: "James O'Brien",       phone: "+971501234001", email: "james.obrien@gmail.com",   source: "website" as const,   status: "new" as const,         notes: "Interested in 2BR apartments. Budget AED 1.2M–1.8M." },
    { name: "Fatima Al Zaabi",     phone: "+971502345002", email: "fatima.zaabi@outlook.com", source: "social" as const,    status: "new" as const,         notes: "DM via Instagram. Looking for family villa." },
    { name: "Chen Wei",            phone: "+971503456003", email: "chen.wei@yahoo.com",       source: "campaign" as const,  status: "new" as const,         notes: "Responded to Palm Residences ad. Investor buyer." },
    { name: "Sophie Müller",       phone: "+971504567004", email: "sophie.muller@web.de",     source: "referral" as const,  status: "new" as const,         notes: "Referred by Rami Khoury. First-time buyer." },

    // CALLED
    { name: "Ahmed Al Rashid",     phone: "+971505678005", email: "ahmed.rashid@hotmail.com", source: "manual" as const,    status: "called" as const,      notes: "Spoke for 15 min. Interested in City Tower One. Wants to visit showroom." },
    { name: "Priya Nair",          phone: "+971506789006", email: "priya.nair@gmail.com",     source: "website" as const,   status: "called" as const,      notes: "Called twice. Considering both Sapphire Heights and The Cove." },
    { name: "Marco Ricci",         phone: "+971507890007", email: "marco.ricci@libero.it",    source: "import" as const,    status: "called" as const,      notes: "Italian investor looking for ROI-focused unit. Budget AED 2M+." },

    // QUALIFIED
    { name: "Aisha Bint Saeed",    phone: "+971508901008", email: "aisha.saeed@icloud.com",   source: "referral" as const,  status: "qualified" as const,   notes: "High-intent buyer. Pre-approved mortgage. Targeting Palm Residences." },
    { name: "David Kim",           phone: "+971509012009", email: "david.kim@naver.com",      source: "social" as const,    status: "qualified" as const,   notes: "Korean expat. Looking for 3BR in family community. Budget AED 3.5M." },
    { name: "Layla Hassan",        phone: "+971501123010", email: "layla.hassan@gmail.com",   source: "campaign" as const,  status: "qualified" as const,   notes: "Attended open day. Very interested in Green Valley Villas." },

    // PROPOSAL
    { name: "Robert Andersen",     phone: "+971502234011", email: "r.andersen@gmail.com",     source: "website" as const,   status: "proposal" as const,    notes: "Proposal sent for Sapphire Heights Unit 12C. Awaiting feedback." },
    { name: "Nadia Petrov",        phone: "+971503345012", email: "nadia.petrov@mail.ru",     source: "manual" as const,    status: "proposal" as const,    notes: "Russian investor. Portfolio buyer. Proposal includes 2 units." },
    { name: "Hamza Al Turki",      phone: "+971504456013", email: "hamza.turki@saudi.net",    source: "referral" as const,  status: "proposal" as const,    notes: "Saudi national. Proposal for villa at Green Valley. Strong interest." },

    // NEGOTIATION
    { name: "Elena Vasquez",       phone: "+971505567014", email: "elena.vasquez@outlook.es", source: "social" as const,    status: "negotiation" as const, notes: "Negotiating price on The Cove townhouse. Counter-offered AED 1.65M." },
    { name: "Tariq Mahmood",       phone: "+971506678015", email: "tariq.mahmood@pk.net",     source: "campaign" as const,  status: "negotiation" as const, notes: "Pakistani expat. In negotiation for 2 investment units in City Tower." },

    // WON
    { name: "Linda Thompson",      phone: "+971507789016", email: "linda.t@hotmail.co.uk",    source: "website" as const,   status: "won" as const,         notes: "Closed deal on Palm Residences Unit 8A. AED 2.95M. Smooth transaction.", outcome: "Signed SPA. Transfer scheduled Q3 2026." },
    { name: "Yusuf Al Jaber",      phone: "+971508890017", email: "yusuf.jaber@gmail.com",    source: "referral" as const,  status: "won" as const,         notes: "Purchased Green Valley Villa #12. AED 4.1M. Cash buyer.", outcome: "SPA signed. Keys handed over." },
    { name: "Mei Lin",             phone: "+971509901018", email: "mei.lin@163.com",          source: "social" as const,    status: "won" as const,         notes: "Investor. Bought 2 units in Sapphire Heights. AED 1.9M combined.", outcome: "Units registered. Rental management agreement signed." },

    // LOST
    { name: "Greg Foster",         phone: "+971501012019", email: "greg.foster@yahoo.com",    source: "import" as const,    status: "lost" as const,        notes: "Lost to competitor. Price was the main objection.", outcome: "Went with cheaper option in JVC." },
    { name: "Hana Čermák",        phone: "+971502123020", email: "hana.cermak@seznam.cz",    source: "campaign" as const,  status: "lost" as const,        notes: "Relocated back to Prague. No longer buying in UAE.", outcome: "Personal circumstances changed." },
  ];

  const salesEmails = ["sales1@propos.app","sales2@propos.app","sales3@propos.app","sales4@propos.app","sales5@propos.app"];
  const salesUsers = allUsers.filter(u => salesEmails.includes(u.email));

  const createdLeads: { id: string; name: string; status: string; primarySalesId: string | null }[] = [];

  for (let i = 0; i < leadsData.length; i++) {
    const l = leadsData[i];
    const [existing] = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.name, l.name)).limit(1);
    if (!existing) {
      const assignedSales = salesUsers[i % salesUsers.length];
      const project = createdProjects[i % createdProjects.length];
      const [created] = await db.insert(leadsTable).values({
        name: l.name,
        phone: l.phone,
        email: l.email,
        source: l.source,
        status: l.status,
        notes: l.notes,
        outcome: (l as any).outcome ?? null,
        projectId: project.id,
        primarySalesId: assignedSales?.id ?? null,
        createdBy: assignedSales?.id ?? ceoUser?.id ?? null,
        lastActionAt: daysAgo(Math.floor(Math.random() * 14)),
        createdAt: daysAgo(Math.floor(Math.random() * 60) + 5),
      }).returning({ id: leadsTable.id, name: leadsTable.name, status: leadsTable.status, primarySalesId: leadsTable.primarySalesId });
      createdLeads.push(created);
    } else {
      const lead = await db.select({ id: leadsTable.id, name: leadsTable.name, status: leadsTable.status, primarySalesId: leadsTable.primarySalesId }).from(leadsTable).where(eq(leadsTable.id, existing.id)).limit(1);
      createdLeads.push(lead[0]);
    }
  }
  console.log(`\n✅ ${createdLeads.length} leads seeded`);

  // ── 5. LEAD ACTIVITIES ────────────────────────────────────────────────────
  const activityTemplates = [
    { type: "call" as const,    notes: "Initial discovery call. Client shared budget and preferences.", duration: "12 min" },
    { type: "email" as const,   notes: "Sent project brochure and payment plan details." },
    { type: "meeting" as const, notes: "Showroom visit. Toured 2 model units. Very positive reaction.", duration: "1h 20min" },
    { type: "call" as const,    notes: "Follow-up call. Client reviewing proposal with family.", duration: "8 min" },
    { type: "note" as const,    notes: "Client prefers high floor with sea view. Noted for unit selection." },
    { type: "message" as const, notes: "WhatsApp: sent video walkthrough of the unit." },
  ];

  let actCount = 0;
  for (const lead of createdLeads) {
    if (!lead.primarySalesId) continue;
    const numActivities = ["won","lost","negotiation","proposal"].includes(lead.status) ? 3 : lead.status === "called" || lead.status === "qualified" ? 2 : 1;
    for (let i = 0; i < numActivities; i++) {
      const tmpl = activityTemplates[i % activityTemplates.length];
      await db.insert(leadActivitiesTable).values({
        leadId: lead.id,
        userId: lead.primarySalesId,
        type: tmpl.type,
        notes: tmpl.notes,
        duration: tmpl.duration ?? null,
        createdAt: daysAgo(numActivities - i + Math.floor(Math.random() * 3)),
      }).onConflictDoNothing();
      actCount++;
    }
  }
  console.log(`✅ ${actCount} lead activities seeded`);

  // ── 6. CLIENTS (from won leads) ───────────────────────────────────────────
  const wonLeads = createdLeads.filter(l => l.status === "won");
  const dealValues = ["2950000", "4100000", "950000"];
  let clientCount = 0;

  for (let i = 0; i < wonLeads.length; i++) {
    const lead = wonLeads[i];
    const leadRecord = await db.select().from(leadsTable).where(eq(leadsTable.id, lead.id)).limit(1);
    if (!leadRecord[0]) continue;

    const [existing] = await db.select({ id: clientsTable.id }).from(clientsTable).where(eq(clientsTable.leadId, lead.id)).limit(1);
    if (!existing) {
      await db.insert(clientsTable).values({
        leadId: lead.id,
        name: leadRecord[0].name,
        phone: leadRecord[0].phone,
        email: leadRecord[0].email,
        dealValue: dealValues[i % dealValues.length],
        projectId: leadRecord[0].projectId,
        assignedSalesId: lead.primarySalesId,
        notes: leadRecord[0].outcome ?? "Successful conversion.",
      });
      clientCount++;
    }
  }
  console.log(`✅ ${clientCount} clients seeded`);

  // ── 7. NOTIFICATIONS ──────────────────────────────────────────────────────
  const notifTemplates = [
    { type: "lead_assigned",  titleEn: "New Lead Assigned",          bodyEn: "You have been assigned a new lead: {lead}." },
    { type: "lead_won",       titleEn: "Deal Closed! 🎉",             bodyEn: "Lead {lead} has been marked as Won. Great work!" },
    { type: "task_reminder",  titleEn: "Follow-up Reminder",          bodyEn: "Don't forget to follow up with {lead} today." },
    { type: "system",         titleEn: "Welcome to PropOS",           bodyEn: "Your account is active. Start managing your leads now." },
  ];

  let notifCount = 0;
  for (const user of salesUsers.slice(0, 5)) {
    for (let i = 0; i < 3; i++) {
      const tmpl = notifTemplates[i % notifTemplates.length];
      const lead = createdLeads[i % createdLeads.length];
      await db.insert(notificationsTable).values({
        userId: user.id,
        type: tmpl.type,
        titleEn: tmpl.titleEn,
        bodyEn: tmpl.bodyEn.replace("{lead}", lead?.name ?? "client"),
        isRead: i === 2,
        createdAt: daysAgo(i),
      });
      notifCount++;
    }
  }
  console.log(`✅ ${notifCount} notifications seeded`);

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Test Credentials (password: Test1234!)");
  console.log("  CEO:         ceo@propos.app        /  Change@Me2026!");
  console.log("  Admin:       admin@propos.app");
  console.log("  Director:    director@propos.app");
  console.log("  Team Lead 1: tl1@propos.app");
  console.log("  Team Lead 2: tl2@propos.app");
  console.log("  Sales Reps:  sales1–5@propos.app");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
