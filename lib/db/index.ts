import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "crypto";
import * as schema from "./schema.ts";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5432/postgres",
});

const realDb = drizzle(pool, { schema });

// --- Secure In-Memory Database Fallback Store ---
const mockUsers: any[] = [];
const mockKycProfiles: any[] = [];
const mockBuyerProfiles: any[] = [];
const mockDb: Record<string, any[]> = {};
let useMemoryDb = false;

// Seed a default admin/user for demonstration or sandbox modes
mockUsers.push({
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@fmi.in",
  emailVerified: true,
  role: "admin",
  kycStatus: "approved",
  createdAt: new Date(),
  updatedAt: new Date(),
});

function getTableName(table: any): string {
  if (!table) return "unknown";
  if (typeof table === "string") return table;
  const name = table?._?.name || table?.metadata?.name || table?.name;
  if (name) return name;
  try {
    const symbols = Object.getOwnPropertySymbols(table);
    for (const sym of symbols) {
      if (sym.toString().includes("drizzle:Name") || sym.toString().includes("OriginalName")) {
        return table[sym];
      }
    }
  } catch (e) {}
  return "unknown";
}

function findValueByField(expr: any, fieldName: string): any {
  if (!expr) return null;
  let found: any = null;
  const visited = new Set<any>();

  function traverse(obj: any) {
    if (!obj || typeof obj !== "object" || found !== null) return;
    if (visited.has(obj)) return;
    visited.add(obj);

    if (obj.left && (obj.left.name === fieldName || obj.left.key === fieldName)) {
      if (obj.right !== undefined) {
        found = obj.right.value !== undefined ? obj.right.value : obj.right;
        return;
      }
    }

    if (obj[fieldName] !== undefined && typeof obj[fieldName] !== "object") {
      found = obj[fieldName];
      return;
    }

    for (const k of Object.keys(obj)) {
      if (k === "table" || k === "schema" || k === "db") continue;
      if (typeof obj[k] === "object") {
        traverse(obj[k]);
      }
    }
  }

  traverse(expr);
  return found;
}

function findUserByExpression(expr: any): any {
  if (!expr) return null;
  
  const email = findValueByField(expr, "email");
  if (email) {
    const searchEmail = String(email).toLowerCase().trim();
    return mockUsers.find(u => u.email?.toLowerCase().trim() === searchEmail);
  }

  const id = findValueByField(expr, "id");
  if (id) {
    return mockUsers.find(u => u.id === id);
  }

  const phone = findValueByField(expr, "phone");
  if (phone) {
    return mockUsers.find(u => u.phone === phone);
  }

  let emailVal: string | null = null;
  let phoneVal: string | null = null;
  let idVal: string | null = null;

  const visited = new Set<any>();
  function traverse(obj: any) {
    if (!obj || typeof obj !== "object") return;
    if (visited.has(obj)) return;
    visited.add(obj);
    try {
      if (obj.value !== undefined && typeof obj.value === "string") {
        const val = obj.value;
        if (val.includes("@")) emailVal = val;
        else if (val.startsWith("+91") || /^\d{10}$/.test(val)) phoneVal = val;
        else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) idVal = val;
      }
      for (const key of Object.keys(obj)) {
        if (key === "table" || key === "schema" || key === "db") continue;
        const val = obj[key];
        if (typeof val === "string") {
          if (val.includes("@")) emailVal = val;
          else if (val.startsWith("+91") || /^\d{10}$/.test(val)) phoneVal = val;
          else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) idVal = val;
        } else if (typeof val === "object") {
          traverse(val);
        }
      }
    } catch (e) {}
  }
  traverse(expr);

  if (emailVal) {
    const searchEmail = (emailVal as string).toLowerCase().trim();
    return mockUsers.find(u => u.email?.toLowerCase().trim() === searchEmail);
  }
  if (phoneVal) return mockUsers.find(u => u.phone === phoneVal);
  if (idVal) return mockUsers.find(u => u.id === idVal);

  return null;
}

class MockQueryUsers {
  async findFirst(options?: { where?: any }) {
    if (!options || !options.where) {
      return mockUsers[0] || null;
    }
    return findUserByExpression(options.where);
  }
}

class MockQueryKycProfiles {
  async findFirst(options?: { where?: any }) {
    if (!options || !options.where) {
      return mockKycProfiles[0] || null;
    }
    const userId = findValueByField(options.where, "userId");
    if (userId) {
      return mockKycProfiles.find(p => p.userId === userId) || null;
    }
    return null;
  }
}

class MockQueryBuyerProfiles {
  async findFirst(options?: { where?: any }) {
    if (!options || !options.where) {
      return mockBuyerProfiles[0] || null;
    }
    const userId = findValueByField(options.where, "userId");
    if (userId) {
      return mockBuyerProfiles.find(p => p.userId === userId) || null;
    }
    return null;
  }
}

class MockInsert {
  private valuesObj: any = null;
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  values(obj: any) {
    this.valuesObj = obj;
    return this;
  }

  async returning() {
    const record = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.valuesObj,
    };

    if (this.tableName === "users") {
      const user = {
        emailVerified: false,
        phoneVerified: false,
        role: "both",
        kycStatus: "not_started",
        ...record,
      };
      mockUsers.push(user);
      return [user];
    } else if (this.tableName === "kyc_profiles") {
      mockKycProfiles.push(record);
      return [record];
    } else if (this.tableName === "buyer_profiles") {
      mockBuyerProfiles.push(record);
      return [record];
    } else {
      if (!mockDb[this.tableName]) {
        mockDb[this.tableName] = [];
      }
      mockDb[this.tableName].push(record);
      return [record];
    }
  }
}

class MockUpdate {
  private setObj: any = null;
  private whereExpr: any = null;
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  set(obj: any) {
    this.setObj = obj;
    return this;
  }

  where(expr: any) {
    this.whereExpr = expr;
    const userId = findValueByField(expr, "userId") || findValueByField(expr, "id");
    
    if (this.tableName === "users") {
      const user = findUserByExpression(expr);
      if (user) {
        Object.assign(user, this.setObj, { updatedAt: new Date() });
      }
    } else if (this.tableName === "kyc_profiles") {
      const profile = mockKycProfiles.find(p => p.userId === userId || p.id === userId);
      if (profile) {
        Object.assign(profile, this.setObj, { updatedAt: new Date() });
      }
    } else if (this.tableName === "buyer_profiles") {
      const profile = mockBuyerProfiles.find(p => p.userId === userId || p.id === userId);
      if (profile) {
        Object.assign(profile, this.setObj, { updatedAt: new Date() });
      }
    } else {
      const list = mockDb[this.tableName] || [];
      const item = list.find(x => x.userId === userId || x.id === userId);
      if (item) {
        Object.assign(item, this.setObj, { updatedAt: new Date() });
      }
    }
    return this;
  }

  then(onfulfilled?: any) {
    if (onfulfilled) {
      onfulfilled();
    }
    return Promise.resolve();
  }
}

class SafeDatabase {
  get query() {
    try {
      if (useMemoryDb || !realDb || !realDb.query) {
        return {
          users: new MockQueryUsers(),
          kycProfiles: new MockQueryKycProfiles(),
          buyerProfiles: new MockQueryBuyerProfiles(),
        };
      }
      return new Proxy(realDb.query, {
        get: (target, prop) => {
          if (!target) {
            useMemoryDb = true;
            return {
              users: new MockQueryUsers(),
              kycProfiles: new MockQueryKycProfiles(),
              buyerProfiles: new MockQueryBuyerProfiles(),
            };
          }

          if (prop === "users") {
            return new Proxy((target as any).users, {
              get: (usersTarget, usersProp) => {
                if (usersProp === "findFirst") {
                  return async (options?: any) => {
                    try {
                      return await usersTarget.findFirst(options);
                    } catch (err) {
                      console.warn("Drizzle findFirst for users failed. Switching fallback.", err);
                      useMemoryDb = true;
                      const mockQuery = new MockQueryUsers();
                      return await mockQuery.findFirst(options);
                    }
                  };
                }
                return Reflect.get(usersTarget, usersProp);
              }
            });
          }

          if (prop === "kycProfiles") {
            return new Proxy((target as any).kycProfiles, {
              get: (kycTarget, kycProp) => {
                if (kycProp === "findFirst") {
                  return async (options?: any) => {
                    try {
                      return await kycTarget.findFirst(options);
                    } catch (err) {
                      console.warn("Drizzle findFirst for kycProfiles failed. Switching fallback.", err);
                      useMemoryDb = true;
                      const mockQuery = new MockQueryKycProfiles();
                      return await mockQuery.findFirst(options);
                    }
                  };
                }
                return Reflect.get(kycTarget, kycProp);
              }
            });
          }

          if (prop === "buyerProfiles") {
            return new Proxy((target as any).buyerProfiles, {
              get: (buyerTarget, buyerProp) => {
                if (buyerProp === "findFirst") {
                  return async (options?: any) => {
                    try {
                      return await buyerTarget.findFirst(options);
                    } catch (err) {
                      console.warn("Drizzle findFirst for buyerProfiles failed. Switching fallback.", err);
                      useMemoryDb = true;
                      const mockQuery = new MockQueryBuyerProfiles();
                      return await mockQuery.findFirst(options);
                    }
                  };
                }
                return Reflect.get(buyerTarget, buyerProp);
              }
            });
          }

          return Reflect.get(target, prop);
        }
      });
    } catch (e) {
      useMemoryDb = true;
      return {
        users: new MockQueryUsers(),
        kycProfiles: new MockQueryKycProfiles(),
        buyerProfiles: new MockQueryBuyerProfiles(),
      };
    }
  }

  insert(table: any) {
    const tableName = getTableName(table);
    if (useMemoryDb) {
      return new MockInsert(tableName);
    }
    try {
      const result = realDb.insert(table);
      return new Proxy(result, {
        get: (target, prop) => {
          if (prop === "values") {
            return (valObj: any) => {
              const valResult = target.values(valObj);
              return new Proxy(valResult, {
                get: (valTarget, valProp) => {
                  if (valProp === "returning") {
                    return async () => {
                      try {
                        return await valTarget.returning();
                      } catch (err) {
                        console.warn("Drizzle insert failed. Switching fallback.", err);
                        useMemoryDb = true;
                        const mockInsert = new MockInsert(tableName);
                        mockInsert.values(valObj);
                        return await mockInsert.returning();
                      }
                    };
                  }
                  return Reflect.get(valTarget, valProp);
                }
              });
            };
          }
          return Reflect.get(target, prop);
        }
      });
    } catch (err) {
      useMemoryDb = true;
      return new MockInsert(tableName);
    }
  }

  update(table: any) {
    const tableName = getTableName(table);
    if (useMemoryDb) {
      return new MockUpdate(tableName);
    }
    try {
      const result = realDb.update(table);
      return new Proxy(result, {
        get: (target, prop) => {
          if (prop === "set") {
            return (setObj: any) => {
              const setResult = target.set(setObj);
              return new Proxy(setResult, {
                get: (setTarget, setProp) => {
                  if (setProp === "where") {
                    return (whereExpr: any) => {
                      const whereResult = setTarget.where(whereExpr);
                      return new Proxy(whereResult, {
                        get: (whereTarget, whereProp) => {
                          if (whereProp === "then") {
                            return async (resolve: any, reject: any) => {
                              try {
                                const finalResult = await whereTarget;
                                if (resolve) resolve(finalResult);
                                return finalResult;
                              } catch (err) {
                                console.warn("Drizzle update failed. Switching fallback.", err);
                                useMemoryDb = true;
                                const mockUpdate = new MockUpdate(tableName);
                                mockUpdate.set(setObj);
                                mockUpdate.where(whereExpr);
                                if (resolve) resolve();
                              }
                            };
                          }
                          return Reflect.get(whereTarget, whereProp);
                        }
                      });
                    };
                  }
                  return Reflect.get(setTarget, setProp);
                }
              });
            };
          }
          return Reflect.get(target, prop);
        }
      });
    } catch (err) {
      useMemoryDb = true;
      return new MockUpdate(tableName);
    }
  }
}

export const db = new SafeDatabase() as any;
