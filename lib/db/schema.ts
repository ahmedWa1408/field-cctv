import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core"

// الموظفون: الرقم الوظيفي يجلب الاسم تلقائيًا في المرات القادمة
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employeeId").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("field"), // field | supervisor | manager
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// إعدادات النظام: موقع الإدارة ونطاقات السماح
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  hqLat: doublePrecision("hqLat"),
  hqLng: doublePrecision("hqLng"),
  hqRadiusKm: doublePrecision("hqRadiusKm").notNull().default(2),
  siteRadiusKm: doublePrecision("siteRadiusKm").notNull().default(3),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// إعدادات الأعمدة القابلة للتخصيص (إعادة تسمية + خيارات منسدلة)
// planNumber = null تعني عمودًا افتراضيًا لكل المسارات
export const columnConfigs = pgTable("column_configs", {
  id: serial("id").primaryKey(),
  planNumber: integer("planNumber"),
  key: text("key").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull().default("dropdown"), // dropdown | text
  options: jsonb("options").$type<string[]>(),
  orderIndex: integer("orderIndex").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// الخطط / المسارات
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  planNumber: integer("planNumber").notNull().unique(),
  route: text("route").notNull(),
  speedLimit: integer("speedLimit"), // حد سرعة افتراضي للمسار (اختياري)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// المواقع داخل كل خطة (مرتبة ترتيبًا ذكيًا)
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  planNumber: integer("planNumber").notNull(),
  code: text("code").notNull(),
  storage: text("storage"),
  mapUrl: text("mapUrl"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  orderIndex: doublePrecision("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// جلسات المسار الميداني (مهمة)
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  planNumber: integer("planNumber").notNull(),
  employeeId: text("employeeId").notNull(),
  employeeName: text("employeeName").notNull(),
  // بيانات السيارة والمعدات
  plateLetters: text("plateLetters"), // 3 أحرف
  plateNumbers: text("plateNumbers"), // أرقام اللوحة
  laptopNumber: text("laptopNumber"),
  flashCount: integer("flashCount"),
  hddCount: integer("hddCount"),
  // ملاحظات عامة واعتماد المشرف
  generalNotes: text("generalNotes"),
  supervisorName: text("supervisorName"),
  supervisorId: text("supervisorId"),
  approved: boolean("approved").notNull().default(false),
  approvedAt: timestamp("approvedAt"),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  endedAt: timestamp("endedAt"),
  active: boolean("active").notNull().default(true),
})

// حالة كل موقع ضمن مهمة
// status: working_clean | working_violation | not_working
export const siteStatuses = pgTable("site_statuses", {
  id: serial("id").primaryKey(),
  missionId: integer("missionId").notNull(),
  siteCode: text("siteCode").notNull(),
  planNumber: integer("planNumber").notNull(),
  status: text("status").notNull(),
  storage: text("storage"), // نوع الوحدة يختاره الموظف: فلاش | هاردسك
  xmlStatus: text("xmlStatus"), // يوجد | لا يوجد
  faultNote: text("faultNote"),
  photoTaken: boolean("photoTaken").notNull().default(false),
  monitorStartAt: timestamp("monitorStartAt"), // بداية المجلد
  monitorEndAt: timestamp("monitorEndAt"), // نهاية المجلد
  visitedAt: timestamp("visitedAt"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// سجل المخالفات التلقائي
// type: overspeed | not_arrived | exit_system | tampering | off_route_long
export const violations = pgTable("violations", {
  id: serial("id").primaryKey(),
  missionId: integer("missionId"),
  planNumber: integer("planNumber").notNull(),
  employeeId: text("employeeId").notNull(),
  employeeName: text("employeeName").notNull(),
  type: text("type").notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
