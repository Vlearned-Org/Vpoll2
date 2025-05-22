import * as bcrypt from "bcrypt";
import { getObjectId } from "mongo-seeding";

const companyIds = [getObjectId("company1"), getObjectId("company2"), getObjectId("company3")];
const users = [];

function encryptPassword(password: string, salt: number = 10): string {
  return bcrypt.hashSync(password, salt);
}

const vpoll_system = {
  _id: getObjectId("system@vpoll.com") as any,
  isAdmin: true,
  name: "Vpoll System Admin",
  email: "system@vpoll.com",
  password: encryptPassword("vpoll"),
  status: "ACTIVE",
  tokens: [],
  roles: [
    {
      role: "system"
    }
  ]
};

const demo1_admin = {
  _id: getObjectId("admin@demo1.com") as any,
  isAdmin: true,
  name: "admin",
  email: "admin@demo1.com",
  password: encryptPassword("vpoll"),
  status: "ACTIVE",
  tokens: [],
  roles: [
    {
      role: "company-system",
      companyId: companyIds[0] as any
    }
  ]
};

const demo2_admin = {
  _id: getObjectId("admin@demo2.com") as any,
  isAdmin: true,
  name: "admin",
  email: "admin@demo2.com",
  password: encryptPassword("vpoll"),
  status: "ACTIVE",
  tokens: [],
  roles: [
    {
      role: "company-system",
      companyId: companyIds[1] as any
    }
  ]
};

const demo3_admin = {
  _id: getObjectId("admin@demo3.com") as any,
  isAdmin: true,
  name: "admin",
  email: "admin@demo3.com",
  password: encryptPassword("vpoll"),
  status: "ACTIVE",
  tokens: [],
  roles: [
    {
      role: "company-system",
      companyId: companyIds[2] as any
    }
  ]
};

const user1 = {
  _id: getObjectId("user1@demo.com") as any,
  isAdmin: false,
  nric: "560101115556",
  mobile: "60121234567",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};

const user2 = {
  _id: getObjectId("user2@demo.com") as any,
  isAdmin: false,
  nric: "010101010001",
  mobile: "601212345678",
  password: encryptPassword("vpoll"),
  isNricVerified: false,
  status: "PENDING",
  tokens: [],
  roles: []
};

const user_1 = {
  _id: getObjectId("user1@getnada.com") as any,
  isAdmin: false,
  nric: "123456010001",
  mobile: "60111234001",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};

const user_2 = {
  _id: getObjectId("user2@getnada.com") as any,
  isAdmin: false,
  nric: "123456010002",
  mobile: "60111234002",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};

const user_3 = {
  _id: getObjectId("user3@getnada.com") as any,
  isAdmin: false,
  nric: "123456010003",
  mobile: "60111234003",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_4 = {
  _id: getObjectId("user4@getnada.com") as any,
  isAdmin: false,
  nric: "123456010004",
  mobile: "60111234004",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_5 = {
  _id: getObjectId("user5@getnada.com") as any,
  isAdmin: false,
  nric: "123456010005",
  mobile: "60111234005",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_6 = {
  _id: getObjectId("user6@getnada.com") as any,
  isAdmin: false,
  nric: "123456010006",
  mobile: "60111234006",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_7 = {
  _id: getObjectId("user7@getnada.com") as any,
  isAdmin: false,
  nric: "123456010007",
  mobile: "60111234007",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_8 = {
  _id: getObjectId("user8@getnada.com") as any,
  isAdmin: false,
  nric: "123456010008",
  mobile: "60111234008",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};
const user_9 = {
  _id: getObjectId("user9@getnada.com") as any,
  isAdmin: false,
  nric: "123456010009",
  mobile: "60111234009",
  accountVerificationStatus: "approved",
  password: encryptPassword("vpoll"),
  isNricVerified: true,
  status: "ACTIVE",
  tokens: [],
  roles: []
};

users.push(
  vpoll_system,
  // demo1_admin,
  // demo2_admin,
  // demo3_admin,
  // user1,
  // user2,
  // user_0,
  user_1,
  user_2,
  user_3,
  user_4,
  user_5,
  user_6,
  user_7,
  user_8,
  user_9
);

export = users;
