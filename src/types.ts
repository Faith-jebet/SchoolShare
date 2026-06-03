export interface Supplier {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  locationName: string; // e.g. "Kawangware Market", "Kibera Stage 2", "Ngong Road Shop"
  coordinates: { x: number; y: number }; // Relative percentage coordinates for our custom simulated map [0 - 100]
  distanceKm: number;
  deliveryTimeMins: number;
  rating: number;
  reviewsCount: number;
  featuredCategory: string; // e.g. "Art & Craft", "Textbooks", "Home Science", "All Supplies"
  averageDeliveryFeeKES: number;
  avatarColor: string;
  hasMpesaTill: boolean;
}

export interface MaterialItem {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  grade: string; // PP1, PP2, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, JSS Grade 7, JSS Grade 8
  subject: string; // "Art & Craft", "Mathematics", "Science & Tech", "Home Science", "Music & PE", "CRE / IRE", "Languages"
  description: string; // e.g. "A3 Size heavyweight Manila paper, pack of 10 sheets, assorted colors"
  priceKES: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  unit: string; // "Pack", "Piece", "Kg", "Set"
  approxCompletionHours?: number; // Sourcing delay if low stock
}

export interface BodaRider {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string; // e.g. "KMDQ 425P"
  currentCoordinates: { x: number; y: number };
}

export type OrderStatus = "Pending Payment" | "Processing" | "Rider Assigned" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

export interface OrderItem {
  materialId: string;
  name: string;
  priceKES: number;
  quantity: number;
  supplierId: string;
}

export interface Order {
  id: string;
  parentName: string;
  parentPhone: string;
  parentLocationName: string;
  parentCoordinates: { x: number; y: number };
  supplierId: string;
  supplierName: string;
  items: OrderItem[];
  subtotalKES: number;
  deliveryFeeKES: number;
  totalKES: number;
  status: OrderStatus;
  rider?: BodaRider;
  createdAt: string;
  paymentMethod: "M-Pesa" | "Cash on Delivery";
  mpesaPinTriggered?: boolean;
  mpesaTransId?: string;
}

export interface CustomSourcingRequest {
  id: string;
  parentName: string;
  parentPhone: string;
  locationName: string;
  className: string; // e.g. "Grade 4 Art"
  description: string; // e.g. "Need dry clay blocks and old newspapers for paper-mache modeling"
  requiredByDate: string;
  createdAt: string;
  status: "Open" | "Fulfilled" | "Closed";
  offers: CustomSourcingOffer[];
}

export interface CustomSourcingOffer {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  estimatedDeliveryHours: number;
  priceKES: number;
  deliveryFeeKES: number;
  remarks: string;
  createdAt: string;
  isAccepted: boolean;
}

export interface AIParsedItem {
  name: string;
  quantity: string;
  subject: string;
  estimatedPriceKESRange: string;
  importance: "Mandatory" | "Recommended" | "Optional";
  localAlternativeSuggestion: string;
  matchedSupplierId?: string;
  matchedSupplierName?: string;
}

export interface AIParsingResult {
  grade: string;
  assessmentTopic?: string;
  items: AIParsedItem[];
  recommendedLocalActions: string[];
}
