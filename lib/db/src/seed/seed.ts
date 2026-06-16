import {
  db,
  usersTable,
  rolePermissionsTable,
  permissionsTable,
  projectsTable,
  leadsTable,
  leadActivitiesTable,
  clientsTable,
  notificationsTable,
  resaleUnitsTable,
  resalePhotosTable,
} from "../index.js";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_LABELS } from "@workspace/permissions";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export async function seed() {
  console.log("🌱 بدء تهيئة قاعدة البيانات...");

  // ── 0. CLEAR ALL DATA ─────────────────────────────────────────────────────
  console.log("\n🗑️  مسح البيانات القديمة...");
  await db.delete(notificationsTable);
  await db.delete(leadActivitiesTable);
  await db.delete(clientsTable);
  await db.delete(resalePhotosTable);
  await db.delete(resaleUnitsTable);
  await db.delete(leadsTable);
  await db.delete(projectsTable);
  await db.delete(rolePermissionsTable);
  await db.delete(permissionsTable);
  await db.delete(usersTable);
  console.log("  ✅ تم مسح جميع البيانات");

  const defaultPassword = await hashPassword("Test1234!");

  // ── 1. USERS ─────────────────────────────────────────────────────────────
  console.log("\n👥 إنشاء المستخدمين...");
  const ceoEmail = process.env["CEO_EMAIL"] ?? "ceo@propos.app";
  const ceoPassword = process.env["CEO_PASSWORD"] ?? "Change@Me2026!";

  const usersToCreate = [
    { name: "أحمد السيد",    email: ceoEmail,             passwordHash: await hashPassword(ceoPassword), role: "ceo" as const,         title: "الرئيس التنفيذي" },
    { name: "محمد حسن",      email: "admin@propos.app",   passwordHash: defaultPassword,                 role: "admin" as const,       title: "مدير العمليات" },
    { name: "سارة عبدالله",  email: "director@propos.app",passwordHash: defaultPassword,                 role: "director" as const,    title: "مدير المبيعات" },
    { name: "ليلى مصطفى",    email: "tl1@propos.app",     passwordHash: defaultPassword,                 role: "team_leader" as const, title: "قائدة فريق — القاهرة الجديدة" },
    { name: "كريم إبراهيم",  email: "tl2@propos.app",     passwordHash: defaultPassword,                 role: "team_leader" as const, title: "قائد فريق — 6 أكتوبر والساحل" },
    { name: "منى سعيد",      email: "sales1@propos.app",  passwordHash: defaultPassword,                 role: "sales" as const,       title: "مسؤولة مبيعات" },
    { name: "عمر طارق",      email: "sales2@propos.app",  passwordHash: defaultPassword,                 role: "sales" as const,       title: "مسؤول مبيعات" },
    { name: "رنا الصاوي",    email: "sales3@propos.app",  passwordHash: defaultPassword,                 role: "sales" as const,       title: "مسؤولة مبيعات" },
    { name: "حسام علي",      email: "sales4@propos.app",  passwordHash: defaultPassword,                 role: "sales" as const,       title: "مسؤول مبيعات" },
    { name: "نهال يوسف",     email: "sales5@propos.app",  passwordHash: defaultPassword,                 role: "sales" as const,       title: "مسؤولة مبيعات" },
  ];

  const createdUsers: { id: string; email: string; role: string; name: string }[] = [];
  for (const u of usersToCreate) {
    const [created] = await db.insert(usersTable).values({
      ...u,
      status: "active",
      emailVerifiedAt: new Date(),
    }).returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role, name: usersTable.name });
    createdUsers.push(created);
    console.log(`  ✅ ${u.name} (${u.role})`);
  }

  // Assign team leaders to sales reps
  const tl1 = createdUsers.find(u => u.email === "tl1@propos.app");
  const tl2 = createdUsers.find(u => u.email === "tl2@propos.app");
  const salesReps = createdUsers.filter(u => u.role === "sales");
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
  const roles = ["ceo", "admin", "director", "team_leader", "sales"] as const;
  for (const role of roles) {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] ?? {};
    for (const [key, isEnabled] of Object.entries(defaults)) {
      await db.insert(rolePermissionsTable).values({ role, permissionKey: key, isEnabled }).onConflictDoNothing();
    }
  }
  console.log(`\n✅ تم تهيئة الصلاحيات`);

  // ── 3. PROJECTS ───────────────────────────────────────────────────────────
  console.log("\n🏗️  إنشاء المشاريع العقارية...");
  const ceoUser = createdUsers.find(u => u.role === "ceo");

  const projectsData = [
    {
      name: "هايد بارك القاهرة الجديدة",
      ownerName: "شركة هايد بارك للتطوير العقاري",
      location: "القاهرة الجديدة، التجمع الخامس",
      description: "كمبوند راقٍ يضم فيلات وشقق فاخرة بتصميمات عصرية، يقع على مساحة 6 مليون متر مربع بالقاهرة الجديدة. يتميز بمساحات خضراء شاسعة ونادٍ اجتماعي متكامل.",
      avgPrice: "4500000",
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&q=80",
    },
    {
      name: "مدينتي",
      ownerName: "شركة العربي للمقاولات",
      location: "القاهرة الجديدة، طريق السويس",
      description: "مدينة متكاملة تضم أحياء سكنية متنوعة، مراكز تجارية، ومرافق ترفيهية على مساحة 33 مليون متر مربع. تُعدّ من أكبر المشاريع السكنية في الشرق الأوسط.",
      avgPrice: "3200000",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
    },
    {
      name: "بالم هيلز أكتوبر",
      ownerName: "شركة بالم هيلز للتعمير",
      location: "مدينة 6 أكتوبر، الجيزة",
      description: "كمبوند متكامل بمدينة 6 أكتوبر يوفر وحدات سكنية فاخرة بين الطبيعة الخضراء وأحدث المرافق الترفيهية والخدمية. يضم ملاعب جولف ونادياً رياضياً.",
      avgPrice: "3800000",
      imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
    },
    {
      name: "ماراسي الساحل الشمالي",
      ownerName: "شركة إعمار مصر",
      location: "الساحل الشمالي، سيدي عبدالرحمن",
      description: "مشروع ساحلي فاخر على البحر الأبيض المتوسط، يضم فيلات وشاليهات ومرسى يخوت خاص. يُعدّ من أرقى الوجهات الصيفية على الساحل الشمالي المصري.",
      avgPrice: "7500000",
      imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&q=80",
    },
    {
      name: "زيد التجمع الخامس",
      ownerName: "شركة أورا ديفيلوبرز",
      location: "القاهرة الجديدة، التجمع الخامس",
      description: "أبراج سكنية فاخرة بالتجمع الخامس تجمع بين الحياة العصرية والموقع المتميز قرب المراكز التجارية الكبرى. تصاميم معمارية فريدة من إعمار الدولية.",
      avgPrice: "5200000",
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80",
    },
  ];

  const createdProjects: { id: string; name: string }[] = [];
  for (const p of projectsData) {
    const [created] = await db.insert(projectsTable).values({
      ...p,
      createdBy: ceoUser?.id ?? null,
      isActive: true,
    }).returning({ id: projectsTable.id, name: projectsTable.name });
    createdProjects.push(created);
    console.log(`  ✅ ${p.name}`);
  }

  // ── 4. LEADS ──────────────────────────────────────────────────────────────
  console.log("\n📋 إنشاء العملاء المحتملين...");
  const leadsData = [
    // جديد
    { name: "خالد محمود النجار",   phone: "01001234567", email: "khaled.najjar@gmail.com",   source: "website" as const,  status: "new" as const,         notes: "مهتم بشقة 3 غرف في هايد بارك. الميزانية من 4 إلى 6 مليون جنيه." },
    { name: "ياسمين عبدالعزيز",    phone: "01112345678", email: "yasmin.aziz@outlook.com",   source: "social" as const,   status: "new" as const,         notes: "تواصلت عبر إنستجرام. تبحث عن شقة للسكن في القاهرة الجديدة." },
    { name: "محمود رضا الشافعي",   phone: "01223456789", email: "mahmoud.shafei@yahoo.com",  source: "campaign" as const, status: "new" as const,         notes: "رد على إعلان ماراسي. مستثمر يبحث عن شاليه للإيجار الصيفي." },
    { name: "نيرمين سالم حداد",    phone: "01534567890", email: "nermin.haddad@hotmail.com", source: "referral" as const, status: "new" as const,         notes: "رشّحها أحد عملائنا. تريد شقة استثمارية في التجمع الخامس." },

    // تم الاتصال
    { name: "أيمن عبدالفتاح",      phone: "01045678901", email: "ayman.abdfatah@gmail.com",  source: "manual" as const,   status: "called" as const,      notes: "تحدثنا 20 دقيقة. مهتم بمشروع مدينتي، يريد زيارة الموقع الأسبوع القادم." },
    { name: "هبة رمضان مصطفى",     phone: "01156789012", email: "heba.ramadan@gmail.com",    source: "website" as const,  status: "called" as const,      notes: "اتصلنا مرتين. تدرس بين بالم هيلز أكتوبر وهايد بارك القاهرة الجديدة." },
    { name: "وليد صلاح الدين",     phone: "01267890123", email: "walid.salahudin@outlook.com",source: "import" as const,  status: "called" as const,      notes: "مستثمر خليجي مقيم في القاهرة. يبحث عن وحدتين استثماريتين." },

    // مؤهل
    { name: "أميرة خيرت فوزي",     phone: "01378901234", email: "amira.fawzy@icloud.com",    source: "referral" as const, status: "qualified" as const,   notes: "عميلة جدية. حصلت على موافقة قرض بنكي. تستهدف هايد بارك التجمع الخامس." },
    { name: "طارق عبدالرحيم بكر",  phone: "01589012345", email: "tarek.bakr@gmail.com",      source: "social" as const,   status: "qualified" as const,   notes: "يبحث عن فيلا في ماراسي الساحل الشمالي. الميزانية تصل إلى 12 مليون جنيه." },
    { name: "شيرين حمدي الشيخ",    phone: "01090123456", email: "shereen.hamdy@gmail.com",   source: "campaign" as const, status: "qualified" as const,   notes: "حضرت يوم مفتوح في مدينتي. مهتمة جداً بالوحدات المطلة على النادي الاجتماعي." },

    // عرض سعر
    { name: "كريم فتحي عوض",       phone: "01201234567", email: "karim.awad@gmail.com",      source: "website" as const,  status: "proposal" as const,    notes: "أُرسل له عرض سعر لشقة B-12 في زيد التجمع. ينتظر موافقة الأسرة على العرض." },
    { name: "غادة عصام الدين",     phone: "01312345678", email: "ghada.essamdin@yahoo.com",  source: "manual" as const,   status: "proposal" as const,    notes: "مستثمرة من الإسكندرية. العرض يشمل شقتين في مدينتي بخطة تقسيط 7 سنوات." },
    { name: "إسلام رجب الحسيني",   phone: "01423456789", email: "eslam.rajab@gmail.com",     source: "referral" as const, status: "proposal" as const,    notes: "سعودي مقيم بالقاهرة. عرض سعر لفيلا ببالم هيلز أكتوبر، اهتمام قوي." },

    // تفاوض
    { name: "مريم نبيل السرجاني",  phone: "01534560001", email: "mariam.nabil@outlook.com",  source: "social" as const,   status: "negotiation" as const, notes: "تتفاوض على سعر شاليه في ماراسي. الفارق في السعر 500 ألف جنيه." },
    { name: "يوسف صبري الدسوقي",   phone: "01645678901", email: "youssef.dassouki@gmail.com",source: "campaign" as const, status: "negotiation" as const, notes: "يتفاوض على وحدتين في زيد التجمع. عرض السعر الأخير مقبول مبدئياً." },

    // مكتملة
    { name: "لميس جمال الدين",      phone: "01756789012", email: "lamis.gamaldin@gmail.com",  source: "website" as const,  status: "won" as const, notes: "أتمّت شراء شقة في هايد بارك، وحدة 14-أ، مساحة 185 متر. 5.2 مليون جنيه.", outcome: "وُقّعت العقود وسُدّد المقدم. جاري استكمال إجراءات التسجيل." },
    { name: "عبدالرحمن عزت حجازي", phone: "01867890123", email: "abdo.hagazy@gmail.com",     source: "referral" as const, status: "won" as const, notes: "اشترى فيلا في بالم هيلز أكتوبر. 8.7 مليون جنيه كاش. عميل راقٍ.", outcome: "تسلّم المفاتيح. راضٍ جداً عن الخدمة. أحال إلينا 3 عملاء جدد." },
    { name: "داليا طه منصور",       phone: "01978901234", email: "dalia.mansour@gmail.com",   source: "social" as const,   status: "won" as const, notes: "اشترت شاليه في ماراسي الساحل الشمالي. 9.5 مليون جنيه.", outcome: "وُقّع العقد. استلام المفاتيح مقرر يونيو 2026." },

    // خسارة
    { name: "رامي سمير الغزالي",   phone: "01089012345", email: "ramy.ghazaly@yahoo.com",    source: "import" as const,   status: "lost" as const, notes: "خسرنا المنافسة مع مشروع آخر. المشكلة الأساسية كانت السعر.", outcome: "اختار مشروع بيفرلي هيلز 6 أكتوبر بسعر أقل بمليون جنيه." },
    { name: "نانسي شوقي بهنساوي",  phone: "01190123456", email: "nancy.shawky@gmail.com",    source: "campaign" as const, status: "lost" as const, notes: "سافرت للخارج وأجّلت قرار الشراء لأجل غير مسمى.", outcome: "تأجيل القرار — انتقلت للعيش في كندا بصفة مؤقتة." },
  ];

  const salesEmails = ["sales1@propos.app","sales2@propos.app","sales3@propos.app","sales4@propos.app","sales5@propos.app"];
  const salesUsers = createdUsers.filter(u => salesEmails.includes(u.email));

  const createdLeads: { id: string; name: string; status: string; primarySalesId: string | null }[] = [];
  for (let i = 0; i < leadsData.length; i++) {
    const l = leadsData[i];
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
  }
  console.log(`  ✅ ${createdLeads.length} عميل محتمل`);

  // ── 5. LEAD ACTIVITIES ────────────────────────────────────────────────────
  const activityTemplates = [
    { type: "call" as const,    notes: "مكالمة استكشافية أولى — شارك العميل ميزانيته وتفضيلاته للموقع والمساحة.", duration: "15 دقيقة" },
    { type: "email" as const,   notes: "أُرسل بروشور المشروع وخطة السداد المفصّلة وملف مقارنة الوحدات." },
    { type: "meeting" as const, notes: "زيارة الموقع ومعاينة وحدتين نموذجيتين. ردود فعل إيجابية جداً من العميل.", duration: "1 ساعة 30 دقيقة" },
    { type: "call" as const,    notes: "مكالمة متابعة — العميل يراجع العرض مع أفراد الأسرة قبل اتخاذ القرار.", duration: "10 دقائق" },
    { type: "note" as const,    notes: "العميل يفضّل الطوابق العالية مع إطلالة. تم تدوين الملاحظة لتحديث العروض." },
    { type: "message" as const, notes: "واتساب: أُرسل فيديو جولة افتراضية ثلاثية الأبعاد بالوحدة المقترحة." },
  ];

  let actCount = 0;
  for (const lead of createdLeads) {
    if (!lead.primarySalesId) continue;
    const numActivities = ["won","lost","negotiation","proposal"].includes(lead.status) ? 3 : ["called","qualified"].includes(lead.status) ? 2 : 1;
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
  console.log(`  ✅ ${actCount} نشاط على العملاء المحتملين`);

  // ── 6. CLIENTS (from won leads) ───────────────────────────────────────────
  console.log("\n🤝 إنشاء الصفقات المكتملة...");
  const wonLeads = createdLeads.filter(l => l.status === "won");
  const dealData = [
    { value: "5200000", unit: "14-أ",   type: "apartment", area: "185", payment: "installments", down: "1300000",  installments: 48, installmentAmt: "81250",  contractDate: new Date("2026-03-15") },
    { value: "8700000", unit: "فيلا-7", type: "villa",     area: "420", payment: "cash",         down: null,       installments: null, installmentAmt: null,    contractDate: new Date("2026-04-20") },
    { value: "9500000", unit: "B-23",   type: "chalet",    area: "210", payment: "installments", down: "2375000",  installments: 60, installmentAmt: "118750", contractDate: new Date("2026-05-10") },
  ];

  for (let i = 0; i < wonLeads.length; i++) {
    const lead = wonLeads[i];
    const leadRecord = await db.select().from(leadsTable).where(eq(leadsTable.id, lead.id)).limit(1);
    if (!leadRecord[0]) continue;
    const d = dealData[i % dealData.length];
    await db.insert(clientsTable).values({
      leadId: lead.id,
      name: leadRecord[0].name,
      phone: leadRecord[0].phone,
      email: leadRecord[0].email,
      dealValue: d.value,
      projectId: leadRecord[0].projectId,
      assignedSalesId: lead.primarySalesId,
      notes: leadRecord[0].outcome ?? "صفقة مكتملة بنجاح.",
      unitNumber: d.unit,
      unitType: d.type,
      area: d.area,
      paymentMethod: d.payment,
      downPayment: d.down ?? null,
      contractDate: d.contractDate,
      numberOfInstallments: d.installments ?? null,
      installmentAmount: d.installmentAmt ?? null,
    });
    console.log(`  ✅ صفقة: ${leadRecord[0].name}`);
  }

  // ── 7. RESALE UNITS ───────────────────────────────────────────────────────
  console.log("\n🏠 إنشاء وحدات إعادة البيع...");
  const hydepark  = createdProjects.find(p => p.name.includes("هايد بارك"));
  const madinaty  = createdProjects.find(p => p.name.includes("مدينتي"));
  const palmhills = createdProjects.find(p => p.name.includes("بالم هيلز"));
  const marassi   = createdProjects.find(p => p.name.includes("ماراسي"));

  const resaleData = [
    {
      projectId: hydepark?.id ?? null,
      projectName: "هايد بارك القاهرة الجديدة",
      unitType: "apartment",
      area: "175",
      price: "4800000",
      floor: 5,
      ownerName: "هشام عبدالله فريد",
      ownerPhone: "01012345678",
      ownerEmail: "hisham.farid@gmail.com",
      ownerNotes: "مالك يريد البيع بسبب السفر للخارج. جاد في البيع ومرن في التفاوض.",
      description: "شقة 3 غرف نوم + ريسبشن كبير، إطلالة على الحديقة الرئيسية. تشطيب سوبر لوكس يشمل المطبخ والأجهزة. حديثة الاستلام.",
      isOwnerPhoneHidden: false,
      isOwnerEmailHidden: true,
      isActive: true,
      assignedTo: salesUsers[0]?.id ?? null,
      photos: [
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80",
      ],
    },
    {
      projectId: madinaty?.id ?? null,
      projectName: "مدينتي",
      unitType: "apartment",
      area: "145",
      price: "3100000",
      floor: 3,
      ownerName: "سمر رزق الله توفيق",
      ownerPhone: "01123456789",
      ownerEmail: "samar.rizk@outlook.com",
      ownerNotes: "المالكة ورثت الشقة وتريد البيع. جاهزة للتسليم فوراً والسعر قابل للتفاوض.",
      description: "شقة 3 غرف نوم، تشطيب كامل جاهز للسكن. إطلالة هادئة على الشارع الداخلي. موقع مميز قرب المدرسة الدولية ومركز التسوق.",
      isOwnerPhoneHidden: false,
      isOwnerEmailHidden: false,
      isActive: true,
      assignedTo: salesUsers[1]?.id ?? null,
      photos: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
      ],
    },
    {
      projectId: palmhills?.id ?? null,
      projectName: "بالم هيلز أكتوبر",
      unitType: "villa",
      area: "380",
      price: "8200000",
      floor: 0,
      ownerName: "محمد علاء الدين عثمان",
      ownerPhone: "01234567890",
      ownerEmail: "m.alaa.osman@gmail.com",
      ownerNotes: "المالك مقيم في الخارج. التواصل مسائاً فقط. التفويض ممنوح للمحامي للتفاوض والتوقيع.",
      description: "فيلا مستقلة 4 غرف نوم + غرفة خادمة، حديقة خاصة 120 متر، مسبح خاص. تشطيب فاخر بمواد مستوردة. السعر شامل التكييفات.",
      isOwnerPhoneHidden: true,
      isOwnerEmailHidden: true,
      isActive: true,
      assignedTo: null,
      photos: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      ],
    },
    {
      projectId: marassi?.id ?? null,
      projectName: "ماراسي الساحل الشمالي",
      unitType: "chalet",
      area: "155",
      price: "6500000",
      floor: 1,
      ownerName: "نادية رفعت الدسوقي",
      ownerPhone: "01345678901",
      ownerEmail: "nadia.rafat@yahoo.com",
      ownerNotes: "تمتلك الشاليه منذ 2020 وتريد الترقي لوحدة أكبر في نفس المشروع. تقبل بيعاً سريعاً.",
      description: "شاليه 3 غرف نوم مع تراس مطل مباشرة على البحر. الطابق الأول في فيلا بيتش — أفضل موقع في المشروع. مؤثّث بالكامل جاهز للتسليم.",
      isOwnerPhoneHidden: false,
      isOwnerEmailHidden: false,
      isActive: true,
      assignedTo: null,
      photos: [
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80",
      ],
    },
  ];

  for (const r of resaleData) {
    const { photos, ...unitData } = r;
    const [unit] = await db.insert(resaleUnitsTable).values({
      ...unitData,
      createdBy: ceoUser?.id ?? null,
    }).returning({ id: resaleUnitsTable.id });

    for (let i = 0; i < photos.length; i++) {
      await db.insert(resalePhotosTable).values({
        unitId: unit.id,
        url: photos[i],
        sortOrder: i,
        uploadedBy: ceoUser?.id ?? null,
      });
    }
    console.log(`  ✅ ${unitData.projectName} — ${unitData.unitType}`);
  }

  // ── 8. NOTIFICATIONS ──────────────────────────────────────────────────────
  console.log("\n🔔 إنشاء الإشعارات...");
  const notifTemplates = [
    { type: "lead_assigned", titleEn: "تم تعيين عميل جديد",     bodyEn: "تم تعيينك مسؤولاً عن العميل: {lead}." },
    { type: "lead_won",      titleEn: "صفقة مكتملة 🎉",          bodyEn: "تم إغلاق صفقة {lead} بنجاح. أحسنت!" },
    { type: "task_reminder", titleEn: "تذكير بمتابعة",           bodyEn: "لا تنسَ متابعة العميل {lead} اليوم." },
    { type: "system",        titleEn: "مرحباً بك في PropOS CRM", bodyEn: "حسابك مفعّل. ابدأ بإدارة عملائك المحتملين الآن." },
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
        bodyEn: tmpl.bodyEn.replace("{lead}", lead?.name ?? "العميل"),
        isRead: i === 2,
        createdAt: daysAgo(i),
      });
      notifCount++;
    }
  }
  console.log(`  ✅ ${notifCount} إشعار`);

  console.log("\n🎉 تمت تهيئة قاعدة البيانات بنجاح!");
  console.log("\n📋 بيانات الدخول (كلمة المرور الافتراضية: Test1234!)");
  console.log("  الرئيس التنفيذي:  ceo@propos.app        /  Change@Me2026!");
  console.log("  مدير العمليات:    admin@propos.app");
  console.log("  مدير المبيعات:    director@propos.app");
  console.log("  قائدة فريق 1:     tl1@propos.app");
  console.log("  قائد فريق 2:      tl2@propos.app");
  console.log("  مبيعات 1-5:       sales1–5@propos.app");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("فشلت التهيئة:", err);
    process.exit(1);
  });
