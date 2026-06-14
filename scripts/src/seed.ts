import { db, usersTable, projectsTable, leadsTable, clientsTable, resaleUnitsTable, plannerTasksTable, leadActivitiesTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const [ceo] = await db
    .insert(usersTable)
    .values({
      name: "Ahmad Al-Rashid",
      email: "ceo@propos.ae",
      passwordHash,
      role: "ceo",
      status: "active",
      title: "Chief Executive Officer",
      phone: "+971 50 100 0001",
      isOnline: true,
    })
    .onConflictDoNothing()
    .returning();

  const [admin] = await db
    .insert(usersTable)
    .values({
      name: "Sara Khalil",
      email: "admin@propos.ae",
      passwordHash,
      role: "admin",
      status: "active",
      title: "Sales Director",
      phone: "+971 50 100 0002",
      isOnline: true,
    })
    .onConflictDoNothing()
    .returning();

  const [director] = await db
    .insert(usersTable)
    .values({
      name: "Omar Hassan",
      email: "director@propos.ae",
      passwordHash,
      role: "director",
      status: "active",
      title: "Operations Director",
      phone: "+971 50 100 0003",
      isOnline: false,
    })
    .onConflictDoNothing()
    .returning();

  const [tl1] = await db
    .insert(usersTable)
    .values({
      name: "Fatima Al-Zahra",
      email: "tl1@propos.ae",
      passwordHash,
      role: "team_leader",
      status: "active",
      title: "Senior Team Leader",
      phone: "+971 50 100 0004",
      isOnline: true,
    })
    .onConflictDoNothing()
    .returning();

  const [sales1] = await db
    .insert(usersTable)
    .values({
      name: "Khalid Mansoor",
      email: "sales1@propos.ae",
      passwordHash,
      role: "sales",
      status: "active",
      title: "Senior Sales Agent",
      phone: "+971 50 100 0005",
      isOnline: true,
    })
    .onConflictDoNothing()
    .returning();

  const [sales2] = await db
    .insert(usersTable)
    .values({
      name: "Nour Al-Ahmad",
      email: "sales2@propos.ae",
      passwordHash,
      role: "sales",
      status: "active",
      title: "Sales Agent",
      phone: "+971 50 100 0006",
      isOnline: false,
    })
    .onConflictDoNothing()
    .returning();

  const [pendingUser] = await db
    .insert(usersTable)
    .values({
      name: "Ziad Al-Khoury",
      email: "pending@propos.ae",
      passwordHash,
      role: "sales",
      status: "pending",
      title: "Sales Agent",
      phone: "+971 50 100 0007",
      isOnline: false,
    })
    .onConflictDoNothing()
    .returning();

  const ceoUser = ceo ?? (await db.select().from(usersTable).where(eq(usersTable.email, "ceo@propos.ae")).limit(1))[0];
  const adminUser = admin ?? (await db.select().from(usersTable).where(eq(usersTable.email, "admin@propos.ae")).limit(1))[0];
  const sales1User = sales1 ?? (await db.select().from(usersTable).where(eq(usersTable.email, "sales1@propos.ae")).limit(1))[0];
  const sales2User = sales2 ?? (await db.select().from(usersTable).where(eq(usersTable.email, "sales2@propos.ae")).limit(1))[0];

  console.log("✓ Users seeded");

  // ── Projects ──────────────────────────────────────────────────────────────
  const [proj1] = await db
    .insert(projectsTable)
    .values({
      name: "Palm Azure Residences",
      ownerName: "Emaar Properties",
      location: "Palm Jumeirah, Dubai",
      description: "Ultra-luxury beachfront residences with panoramic sea views. Premium amenities including private beach, infinity pool, and concierge.",
      avgPrice: "4500000",
      isActive: true,
      createdBy: ceoUser?.id,
    })
    .onConflictDoNothing()
    .returning();

  const [proj2] = await db
    .insert(projectsTable)
    .values({
      name: "Creek Horizon Tower",
      ownerName: "Meraas",
      location: "Dubai Creek Harbour",
      description: "Modern high-rise with stunning creek views. Smart home technology and world-class facilities.",
      avgPrice: "1800000",
      isActive: true,
      createdBy: ceoUser?.id,
    })
    .onConflictDoNothing()
    .returning();

  const [proj3] = await db
    .insert(projectsTable)
    .values({
      name: "Golden Square Villas",
      ownerName: "Damac Properties",
      location: "Arabian Ranches, Dubai",
      description: "Family-friendly villa community with green spaces, swimming pools, and top schools nearby.",
      avgPrice: "3200000",
      isActive: true,
      createdBy: adminUser?.id,
    })
    .onConflictDoNothing()
    .returning();

  const proj1Row = proj1 ?? (await db.select().from(projectsTable).limit(1))[0];
  const proj2Row = proj2 ?? (await db.select().from(projectsTable).limit(1))[0];
  const proj3Row = proj3 ?? (await db.select().from(projectsTable).limit(1))[0];

  console.log("✓ Projects seeded");

  // ── Resale Units ──────────────────────────────────────────────────────────
  await db.insert(resaleUnitsTable).values([
    {
      projectId: proj1Row?.id,
      projectName: "Palm Azure Residences",
      area: "220",
      price: "5200000",
      floor: 12,
      unitType: "3BR Apartment",
      description: "Stunning sea view unit with premium finishes. Motivated seller.",
      ownerName: "Mr. Al-Farsi",
      ownerPhone: "+971 55 234 5678",
      ownerEmail: "alfarsi@email.com",
      isActive: true,
    },
    {
      projectId: proj2Row?.id,
      projectName: "Creek Horizon Tower",
      area: "95",
      price: "1650000",
      floor: 25,
      unitType: "1BR Apartment",
      description: "High floor creek view. Currently rented at AED 120K/year.",
      ownerName: "Ms. Chen",
      ownerPhone: "+971 55 345 6789",
      isActive: true,
    },
    {
      projectId: proj3Row?.id,
      projectName: "Golden Square Villas",
      area: "450",
      price: "3800000",
      floor: 1,
      unitType: "5BR Villa",
      description: "Corner plot villa with private pool and landscaped garden.",
      ownerName: "Mr. Al-Rashidi",
      ownerPhone: "+971 50 456 7890",
      isActive: true,
    },
  ]).onConflictDoNothing();

  console.log("✓ Resale units seeded");

  // ── Leads ──────────────────────────────────────────────────────────────────
  const leadsData = [
    { name: "Mohammed Al-Sayed", phone: "+971 52 111 2222", email: "msayed@gmail.com", source: "campaign" as const, status: "new" as const, projectId: proj1Row?.id, primarySalesId: sales1User?.id },
    { name: "Jennifer Walsh", phone: "+971 55 222 3333", email: "jwalsh@email.com", source: "website" as const, status: "called" as const, projectId: proj2Row?.id, primarySalesId: sales1User?.id },
    { name: "Rami Hakim", phone: "+971 50 333 4444", email: "rhakim@email.com", source: "referral" as const, status: "qualified" as const, projectId: proj1Row?.id, primarySalesId: sales2User?.id },
    { name: "Priya Sharma", phone: "+971 56 444 5555", email: "psharma@email.com", source: "social" as const, status: "proposal" as const, projectId: proj3Row?.id, primarySalesId: sales1User?.id },
    { name: "James Richardson", phone: "+971 54 555 6666", email: "jrichardson@email.com", source: "campaign" as const, status: "negotiation" as const, projectId: proj2Row?.id, primarySalesId: sales2User?.id },
    { name: "Aisha Al-Mansoori", phone: "+971 52 666 7777", email: "aisha@email.com", source: "manual" as const, status: "won" as const, projectId: proj1Row?.id, primarySalesId: sales1User?.id },
    { name: "David Chen", phone: "+971 55 777 8888", email: "dchen@email.com", source: "website" as const, status: "lost" as const, projectId: proj3Row?.id, primarySalesId: sales2User?.id },
    { name: "Fatima Zahra Al-Idrissi", phone: "+971 50 888 9999", email: "fazahara@email.com", source: "referral" as const, status: "qualified" as const, projectId: proj2Row?.id, primarySalesId: sales1User?.id },
    { name: "Viktor Petrov", phone: "+971 56 999 0000", email: "vpetrov@email.com", source: "import" as const, status: "new" as const, projectId: proj3Row?.id, primarySalesId: sales2User?.id },
    { name: "Layla Nasser", phone: "+971 52 000 1111", email: "lnasser@email.com", source: "campaign" as const, status: "called" as const, projectId: proj1Row?.id, primarySalesId: sales1User?.id },
    { name: "Marcus Johnson", phone: "+971 55 111 2222", email: "mjohnson@email.com", source: "social" as const, status: "proposal" as const, projectId: proj2Row?.id, primarySalesId: sales2User?.id },
    { name: "Hana Al-Mutairi", phone: "+971 54 222 3333", source: "manual" as const, status: "won" as const, projectId: proj3Row?.id, primarySalesId: sales1User?.id },
  ];

  const insertedLeads = await db.insert(leadsTable).values(leadsData.map(l => ({ ...l, createdBy: ceoUser?.id }))).onConflictDoNothing().returning();
  const allLeads = insertedLeads.length > 0 ? insertedLeads : await db.select().from(leadsTable).limit(12);

  console.log("✓ Leads seeded");

  // ── Lead Activities ─────────────────────────────────────────────────────
  if (allLeads.length > 0 && sales1User) {
    await db.insert(leadActivitiesTable).values([
      { leadId: allLeads[0].id, userId: sales1User.id, type: "call" as const, notes: "Initial contact. Client interested in 3BR units facing the sea.", outcome: "Positive — scheduling viewing", nextAction: "Book property tour", duration: "12" },
      { leadId: allLeads[1].id, userId: sales1User.id, type: "meeting" as const, notes: "Site visit completed. Client loved the amenities.", outcome: "Very interested", nextAction: "Send payment plan options" },
      { leadId: allLeads[2].id, userId: sales2User?.id ?? sales1User.id, type: "call" as const, notes: "Follow-up call. Discussed payment options and post-handover plans.", outcome: "Ready to proceed", nextAction: "Prepare proposal" },
      { leadId: allLeads[5].id, userId: sales1User.id, type: "status_change" as const, notes: "Deal closed! Client signed SPA and paid deposit.", outcome: "AED 4.5M deal closed" },
    ]).onConflictDoNothing();
  }

  console.log("✓ Lead activities seeded");

  // ── Clients ──────────────────────────────────────────────────────────────
  if (allLeads.length > 5) {
    await db.insert(clientsTable).values([
      {
        name: "Aisha Al-Mansoori",
        phone: "+971 52 666 7777",
        email: "aisha@email.com",
        dealValue: "4500000",
        projectId: proj1Row?.id,
        assignedSalesId: sales1User?.id,
        notes: "Converted from Palm Azure lead. Wants property management referral.",
        leadId: allLeads[5]?.id,
      },
      {
        name: "Hana Al-Mutairi",
        phone: "+971 54 222 3333",
        dealValue: "3200000",
        projectId: proj3Row?.id,
        assignedSalesId: sales1User?.id,
        notes: "Golden Square villa purchase. Settlement in Q1 2026.",
        leadId: allLeads[11]?.id,
      },
    ]).onConflictDoNothing();
  }

  console.log("✓ Clients seeded");

  // ── Planner Tasks ─────────────────────────────────────────────────────
  if (sales1User) {
    const today = new Date().toISOString().split("T")[0]!;
    await db.insert(plannerTasksTable).values([
      { userId: sales1User.id, date: today, title: "Follow up with Mohammed Al-Sayed on Palm Azure viewing", isDone: false, priority: "high", position: 0 },
      { userId: sales1User.id, date: today, title: "Send payment plan documents to Rami Hakim", isDone: false, priority: "high", position: 1 },
      { userId: sales1User.id, date: today, title: "Call 5 new leads from weekend campaign", isDone: true, priority: "medium", position: 2 },
      { userId: sales1User.id, date: today, title: "Update CRM notes from yesterday's meetings", isDone: true, priority: "low", position: 3 },
    ]).onConflictDoNothing();
  }

  console.log("✓ Planner tasks seeded");
  console.log("");
  console.log("✅ Seed complete!");
  console.log("");
  console.log("Login credentials:");
  console.log("  CEO:    ceo@propos.ae / password123");
  console.log("  Admin:  admin@propos.ae / password123");
  console.log("  Sales:  sales1@propos.ae / password123");
  console.log("  Sales:  sales2@propos.ae / password123");
  console.log("  Pending: pending@propos.ae / password123");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
