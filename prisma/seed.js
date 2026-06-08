const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const occupantsData = [
  {
    id: "second",
    name: "Second Floor",
    badge: "Commercial",
    badgeClass: "badge-commercial",
    icon: "2F",
    isVacant: false,
    isSplit: false,
    areaSft: "1,800 SFT",
    tenantName: "Royal Dental Care & Orthodontic Center",
    tenantCategory: "Healthcare",
    tenantInitials: "RD",
    tenantDescription: "Advanced dental treatments, cosmetic dentistry, and root canal specialty clinic.",
    tenantContact: "Dr. K. S. Rao | Room 301-303",
    floorImages: "images/lobby.png"
  },
  {
    id: "first",
    name: "First Floor",
    badge: "Office / Commercial",
    badgeClass: "badge-office",
    icon: "1F",
    isVacant: false,
    isSplit: false,
    areaSft: "1,800 SFT",
    tenantName: "Avanthi Tech Solutions",
    tenantCategory: "Office",
    tenantInitials: "AT",
    tenantDescription: "Software development, digital marketing consultation, and IT infrastructure services.",
    tenantContact: "Suite 101-102 | Contact: info@avanthitech.com",
    floorImages: "images/lobby.png"
  },
  {
    id: "ground",
    name: "Ground Floor",
    badge: "Commercial",
    badgeClass: "badge-commercial",
    icon: "GF",
    isVacant: false,
    isSplit: false,
    areaSft: "2,000 SFT",
    tenantName: "Sri Sai Medicals & Diagnostics",
    tenantCategory: "Healthcare / Pharmacy",
    tenantInitials: "SS",
    tenantDescription: "24/7 retail pharmacy, clinical diagnostics lab, and general physician consult chambers.",
    tenantContact: "Shop 1 & 2 | Call: +91 88865 12345",
    floorImages: "images/parking.png"
  },
  {
    id: "shed1",
    name: "Shed 1",
    badge: "Commercial / Industrial",
    badgeClass: "badge-industrial",
    icon: "S1",
    isVacant: false,
    isSplit: false,
    areaSft: "3,500 SFT",
    tenantName: "Aditya Logistics & Warehousing",
    tenantCategory: "Industrial",
    tenantInitials: "AL",
    tenantDescription: "Storage, distribution center, and cargo clearing services for Rajamahendravaram region.",
    tenantContact: "Shed Unit 1 | Manager: B. Prasad",
    floorImages: "images/shed.png"
  },
  {
    id: "shed2",
    name: "Shed 2",
    badge: "Commercial / Industrial",
    badgeClass: "badge-industrial",
    icon: "S2",
    isVacant: false,
    isSplit: false,
    areaSft: "3,000 SFT",
    tenantName: "Green Fields Agro Services",
    tenantCategory: "Industrial",
    tenantInitials: "GF",
    tenantDescription: "Distribution of organic seeds, fertilizers, and agricultural equipment consulting.",
    tenantContact: "Shed Unit 2 | info@greenfieldsagro.in",
    floorImages: "images/shed.png"
  },
  {
    id: "shed2a",
    name: "Shed 2 - Part A",
    badge: "Commercial / Industrial",
    badgeClass: "badge-industrial",
    icon: "S2A",
    isVacant: false,
    isSplit: false,
    areaSft: "1,500 SFT",
    tenantName: "Green Fields Agro Services",
    tenantCategory: "Industrial",
    tenantInitials: "GF",
    tenantDescription: "Distribution of organic seeds, fertilizers, and agricultural equipment consulting.",
    tenantContact: "Shed Unit 2A | info@greenfieldsagro.in",
    floorImages: "images/shed.png"
  },
  {
    id: "shed2b",
    name: "Shed 2 - Part B",
    badge: "Commercial / Industrial",
    badgeClass: "badge-industrial",
    icon: "S2B",
    isVacant: true,
    isSplit: false,
    areaSft: "1,500 SFT",
    tenantName: "",
    tenantCategory: "",
    tenantInitials: "",
    tenantDescription: "Vacant industrial space open for regional warehouse layouts.",
    tenantContact: "Shed Unit 2B | Call: +91 98765 43210",
    floorImages: "images/parking.png"
  }
];

const galleryData = [
  {
    id: "ext",
    title: "Exterior View",
    description: "The main front facade of Vishala Vista, showing the modern 3-story concrete and glass architecture.",
    url: "images/exterior.png"
  },
  {
    id: "lobby",
    title: "Lobby Area",
    description: "Clean, spacious lobby entrance equipped with contemporary accents, ideal for welcoming commercial clients.",
    url: "images/lobby.png"
  },
  {
    id: "parking",
    title: "Parking Space",
    description: "Spacious ground floor parking bays allocated for occupants and visitors, providing convenient accessibility.",
    url: "images/parking.png"
  },
  {
    id: "shed",
    title: "Shed 1 Interior",
    description: "High-ceiling, naturally lit commercial warehouse shed interior, ideal for regional logistics and distribution.",
    url: "images/shed.png"
  }
];

async function main() {
  console.log("Starting DB Seeding...");
  
  // Clear existing
  await prisma.occupant.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  await prisma.propertyInfo.deleteMany({});
  console.log("Cleared existing data.");

  // Seeding occupants
  for (const item of occupantsData) {
    await prisma.occupant.create({ data: item });
  }
  console.log(`Successfully seeded ${occupantsData.length} occupants.`);

  // Seeding gallery
  for (const item of galleryData) {
    await prisma.galleryImage.create({ data: item });
  }
  console.log(`Successfully seeded ${galleryData.length} gallery images.`);

  // Seeding propertyInfo
  await prisma.propertyInfo.create({
    data: {
      id: "about",
      title: "Modern Infrastructure in Tadithota",
      description1: "Vishala Vista is a premier 3-story multi-purpose building featuring advanced architectural planning, located strategically at Government Colony, Tadithota, Rajamahendravaram. With a design optimized for both commercial and residential tenants, the property incorporates robust power backup, modern elevator access, and structured fire-safety protocols.",
      description2: "Adjacent to the main building are 2 high-capacity commercial sheds, providing prime logistics and agriculture storage space in the heart of the city.",
      accessTitle: "Flexible Access",
      accessDetails: "Operating hours from 8:00 AM to 8:00 PM, Monday to Saturday.",
      locationTitle: "Prime Location",
      locationDetails: "Located close to vital transport links and main commercial markets.",
      scheduleTitle: "Operating Schedule",
      scheduleWeekdays: "Monday - Saturday: 8:00 AM - 8:00 PM",
      scheduleSunday: "Sunday: Closed (Closed for public, tenant access only)",
      amenityTitle: "Building Amenities",
      amenities: "High-speed passenger elevator & wide stairways; Dedicated 24/7 security guard presence; Uninterrupted power backup generator & water supply; Designated visitors' parking lobby on ground floor",
      contactEmail: "info@vishalavista.com",
      contactPhones: "+91 98765 43210, +91 88865 12345"
    }
  });
  console.log("Successfully seeded PropertyInfo data.");
  
  console.log("Database Seeding Completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
