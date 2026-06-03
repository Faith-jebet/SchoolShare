import { Supplier, MaterialItem, BodaRider, Order, CustomSourcingRequest } from "./types";

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup_musa",
    name: "Musa Stationery & Local Printing",
    ownerName: "Mzee Musa Mwangi",
    phone: "+254 712 345 678",
    locationName: "Kawangware Posta Market, Nairobi",
    coordinates: { x: 35, y: 42 },
    distanceKm: 1.8,
    deliveryTimeMins: 20,
    rating: 4.8,
    reviewsCount: 142,
    featuredCategory: "Stationery & Textbooks",
    averageDeliveryFeeKES: 100,
    avatarColor: "bg-emerald-100 text-emerald-800",
    hasMpesaTill: true,
  },
  {
    id: "sup_cynthia",
    name: "Mama Cynthia Art & Craft Hub",
    ownerName: "Mama Cynthia Wambui",
    phone: "+254 722 987 654",
    locationName: "Kibera Stage 2 (Opposite Cooperative Bank), Nairobi",
    coordinates: { x: 48, y: 56 },
    distanceKm: 3.4,
    deliveryTimeMins: 35,
    rating: 4.9,
    reviewsCount: 218,
    featuredCategory: "Art & Modeling Supplies",
    averageDeliveryFeeKES: 150,
    avatarColor: "bg-amber-100 text-amber-800",
    hasMpesaTill: true,
  },
  {
    id: "sup_uhuru",
    name: "Uhuru Highway Academic Bookstall",
    ownerName: "Dennis Kiprotich",
    phone: "+254 733 445 566",
    locationName: "Ngong Road Junction Stall 4B, Nairobi",
    coordinates: { x: 55, y: 30 },
    distanceKm: 2.2,
    deliveryTimeMins: 25,
    rating: 4.6,
    reviewsCount: 89,
    featuredCategory: "CBC Textbooks & Music rec",
    averageDeliveryFeeKES: 120,
    avatarColor: "bg-blue-100 text-blue-800",
    hasMpesaTill: true,
  },
  {
    id: "sup_kiprono",
    name: "Kiprono Science & Home-Science Supplies",
    ownerName: "Gideon Kiprono",
    phone: "+254 701 555 123",
    locationName: "Kasarani Depot Area, Nairobi",
    coordinates: { x: 75, y: 22 },
    distanceKm: 7.5,
    deliveryTimeMins: 55,
    rating: 4.7,
    reviewsCount: 112,
    featuredCategory: "Science Kits & Aprons",
    averageDeliveryFeeKES: 250,
    avatarColor: "bg-purple-100 text-purple-800",
    hasMpesaTill: false,
  }
];

export const INITIAL_MATERIALS: MaterialItem[] = [
  // Musa Stationery
  {
    id: "mat_1",
    supplierId: "sup_musa",
    supplierName: "Musa Stationery & Local Printing",
    name: "Grade 3 Math counting sticks (Packet of 150 units)",
    grade: "Grade 3",
    subject: "Mathematics",
    description: "Eco-friendly, smooth colored wood sticks for numbering, decimals, and basic operations practice.",
    priceKES: 120,
    stockStatus: "In Stock",
    unit: "Pack",
  },
  {
    id: "mat_2",
    supplierId: "sup_musa",
    supplierName: "Musa Stationery & Local Printing",
    name: "Standard Ruled Writing Homework Books (120 Pages)",
    grade: "Grade 1",
    subject: "Languages",
    description: "Sufficiently thick pages to resist pencil tears, perfect for lowercase-uppercase learning scripts.",
    priceKES: 60,
    stockStatus: "In Stock",
    unit: "Piece",
  },
  {
    id: "mat_3",
    supplierId: "sup_musa",
    supplierName: "Musa Stationery & Local Printing",
    name: "JSS Grade 7 Smart Minds Mathematics Workbook",
    grade: "Grade 7",
    subject: "Mathematics",
    description: "Fully approved workbook alignment with KLB (Kenya Literature Bureau) structures, multiple exercises included.",
    priceKES: 380,
    stockStatus: "Low Stock",
    unit: "Piece",
    approxCompletionHours: 4,
  },

  // Mama Cynthia Hub
  {
    id: "mat_4",
    supplierId: "sup_cynthia",
    supplierName: "Mama Cynthia Art & Craft Hub",
    name: "Grade 4 Art & Craft Clay Modeling Block (Premium)",
    grade: "Grade 4",
    subject: "Art & Craft",
    description: "Naturally filtered river bed clay. Stays malleable inside airtight container, non-toxic, doesn't crumble.",
    priceKES: 150,
    stockStatus: "In Stock",
    unit: "Pack",
  },
  {
    id: "mat_5",
    supplierId: "sup_cynthia",
    supplierName: "Mama Cynthia Art & Craft Hub",
    name: "A3 Heavyweight Colored Manila Papers (Bundle of 12)",
    grade: "Grade 5",
    subject: "Art & Craft",
    description: "Set of 12 distinct lively colors. Durable weight, thick sheets suitable for cutting out model houses and charts.",
    priceKES: 250,
    stockStatus: "In Stock",
    unit: "Pack",
  },
  {
    id: "mat_6",
    supplierId: "sup_cynthia",
    supplierName: "Mama Cynthia Art & Craft Hub",
    name: "Non-Toxic PVA Glue & Brush Combo (250ml)",
    grade: "Grade 2",
    subject: "Art & Craft",
    description: "Washable clear craft glue, safe for infants. Comes with a wide application brush for papier-mâché crafts.",
    priceKES: 180,
    stockStatus: "In Stock",
    unit: "Set",
  },

  // Uhuru Academic Bookstall
  {
    id: "mat_7",
    supplierId: "sup_uhuru",
    supplierName: "Uhuru Highway Academic Bookstall",
    name: "CBC Grade 6 Music Soprano Recorder Flute",
    grade: "Grade 6",
    subject: "Music & PE",
    description: "Authentic double-hole C soprano recorder. Recommended model by Nairobi County music educators, durable plastic with cleaning rod.",
    priceKES: 320,
    stockStatus: "In Stock",
    unit: "Piece",
  },
  {
    id: "mat_8",
    supplierId: "sup_uhuru",
    supplierName: "Uhuru Highway Academic Bookstall",
    name: "Braided Nylon Jump Rope with Wooden Grips",
    grade: "Grade 4",
    subject: "Music & PE",
    description: "Strong 2.5-meter skipping rope suitable for physical health, coordination exercises, and play sessions.",
    priceKES: 160,
    stockStatus: "In Stock",
    unit: "Piece",
  },

  // Kiprono kits
  {
    id: "mat_9",
    supplierId: "sup_kiprono",
    supplierName: "Kiprono Science & Home-Science Supplies",
    name: "Grade 5 Home Science Apron & Chef Cap Set (White)",
    grade: "Grade 5",
    subject: "Home Science",
    description: "Quality washable cotton drill. Universal sizing with adjustable side belts, protects children's uniforms during kitchen lessons.",
    priceKES: 450,
    stockStatus: "In Stock",
    unit: "Set",
  },
  {
    id: "mat_10",
    supplierId: "sup_kiprono",
    supplierName: "Kiprono Science & Home-Science Supplies",
    name: "Junior Secondary Grade 7 Safety Science Goggles",
    grade: "Grade 7",
    subject: "Science & Tech",
    description: "Anti-fog protective eyewear with wide elastic head strap. Safe for mixing basic acidic, alkaline food items for lab studies.",
    priceKES: 220,
    stockStatus: "In Stock",
    unit: "Piece",
  },
  {
    id: "mat_11",
    supplierId: "sup_kiprono",
    supplierName: "Kiprono Science & Home-Science Supplies",
    name: "Grade 6 Agriculture Seedlings kit (Assorted Maize & Beans)",
    grade: "Grade 6",
    subject: "Science & Tech",
    description: "Pre-treated hybrid seeds package + 1 small soil testing vial. High germination rate, ideal for seedling transplantation lessons.",
    priceKES: 200,
    stockStatus: "Low Stock",
    unit: "Pack",
    approxCompletionHours: 8,
  }
];

export const INITIAL_RIDERS: BodaRider[] = [
  {
    id: "rider_john",
    name: "John 'Joni' Mwangi",
    phone: "+254 755 888 222",
    vehicleNo: "KMDQ 425P",
    currentCoordinates: { x: 38, y: 44 }
  },
  {
    id: "rider_kevo",
    name: "David 'Kevo' Kamau",
    phone: "+254 711 777 333",
    vehicleNo: "KMEE 908B",
    currentCoordinates: { x: 45, y: 52 }
  },
  {
    id: "rider_vanny",
    name: "Evans 'Vanny' Kipkorir",
    phone: "+254 722 444 888",
    vehicleNo: "KMDD 112A",
    currentCoordinates: { x: 53, y: 32 }
  },
  {
    id: "rider_boni",
    name: "Boniface 'Boni' Onyango",
    phone: "+254 799 111 666",
    vehicleNo: "KMFF 654Z",
    currentCoordinates: { x: 70, y: 25 }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_101",
    parentName: "Faith Kiprono",
    parentPhone: "+254 701 444 333",
    parentLocationName: "Ngong Road Townhouses Apt 12, Nairobi",
    parentCoordinates: { x: 50, y: 40 },
    supplierId: "sup_musa",
    supplierName: "Musa Stationery & Local Printing",
    items: [
      {
        materialId: "mat_1",
        name: "Grade 3 Math counting sticks (Packet of 150 units)",
        priceKES: 120,
        quantity: 2,
        supplierId: "sup_musa",
      }
    ],
    subtotalKES: 240,
    deliveryFeeKES: 100,
    totalKES: 340,
    status: "Delivered",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
    paymentMethod: "M-Pesa",
    mpesaTransId: "RKC4X89LM2",
  },
  {
    id: "ord_102",
    parentName: "Faith Kiprono",
    parentPhone: "+254 701 444 333",
    parentLocationName: "Ngong Road Townhouses Apt 12, Nairobi",
    parentCoordinates: { x: 50, y: 40 },
    supplierId: "sup_cynthia",
    supplierName: "Mama Cynthia Art & Craft Hub",
    items: [
      {
        materialId: "mat_4",
        name: "Grade 4 Art & Craft Clay Modeling Block (Premium)",
        priceKES: 150,
        quantity: 3,
        supplierId: "sup_cynthia",
      },
      {
        materialId: "mat_5",
        name: "A3 Heavyweight Colored Manila Papers (Bundle of 12)",
        priceKES: 250,
        quantity: 1,
        supplierId: "sup_cynthia",
      }
    ],
    subtotalKES: 700,
    deliveryFeeKES: 150,
    totalKES: 850,
    status: "In Transit",
    rider: INITIAL_RIDERS[1], // Kevo
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    paymentMethod: "M-Pesa",
    mpesaPinTriggered: true,
    mpesaTransId: "RKC9P34AA1",
  }
];

export const INITIAL_CUSTOM_REQUESTS: CustomSourcingRequest[] = [
  {
    id: "req_201",
    parentName: "Richard Ombati",
    parentPhone: "+254 711 222 333",
    locationName: "Uthiru Estate, near Stage, Nairobi",
    className: "Grade 5 Agriculture",
    description: "Sourcing for 2kg of natural loam soil mixed with sawdust, specifically packaged in a polythene bag for Term 2 garden simulation labs.",
    requiredByDate: "2026-06-08",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: "Open",
    offers: [
      {
        id: "off_1",
        supplierId: "sup_cynthia",
        supplierName: "Mama Cynthia Art & Craft Hub",
        supplierPhone: "+254 722 987 654",
        estimatedDeliveryHours: 12,
        priceKES: 180,
        deliveryFeeKES: 180,
        remarks: "I can source organic loam from my kitchen garden in Kibera and package it safely for your child. High quality!",
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        isAccepted: false,
      }
    ]
  },
  {
    id: "req_202",
    parentName: "Faith Kiprono",
    parentPhone: "+254 701 444 333",
    locationName: "Ngong Road Townhouses Apt 12, Nairobi",
    className: "Grade 6 Music & PE",
    description: "Looking for a locally crafted traditional cowhide shaker/rattle (Kayamba) for Music practical presentation.",
    requiredByDate: "2026-06-10",
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    status: "Open",
    offers: [
      {
        id: "off_2",
        supplierId: "sup_uhuru",
        supplierName: "Uhuru Highway Academic Bookstall",
        supplierPhone: "+254 733 445 566",
        estimatedDeliveryHours: 6,
        priceKES: 450,
        deliveryFeeKES: 120,
        remarks: "I have 2 authentic reed/cowhide kayambas in my stock right now. They make perfect crisp rhythm sound required by the CBC examiner.",
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        isAccepted: false,
      }
    ]
  }
];
