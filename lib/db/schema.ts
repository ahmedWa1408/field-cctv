import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core"

// الموظفون: الرقم الوظيفي يجلب الاسم تلقائيًا في المرات القادمة
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employeeId").notNull().unique(),
  name: text("name").notNull(),
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
  storage: text("storage"), // نوع وحدة التخزين يختاره الموظف: فلاش | هارد ديسك
  faultNote: text("faultNote"),
  photoTaken: boolean("photoTaken").notNull().default(false),
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
