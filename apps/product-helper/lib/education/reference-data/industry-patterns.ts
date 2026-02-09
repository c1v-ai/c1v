/**
 * Industry Entity Catalogs
 *
 * Vendor-neutral entity patterns per vertical, synthesized from
 * multiple reference architectures (HL7 FHIR, Stripe/Plaid,
 * Shopify/Medusa/Saleor, Canvas/Open edX, DMS patterns).
 */

import type { IndustryEntityCatalog } from './types';

export const industryPatterns: Record<string, IndustryEntityCatalog> = {
  healthcare: {
    industry: 'healthcare',
    entities: [
      {
        name: 'Patient',
        description: 'Individual receiving care, central entity in all clinical workflows',
        keyFields: ['mrn', 'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_type', 'emergency_contact_id', 'insurance_coverage_id'],
        relationships: ['has many Encounters', 'has many Medications', 'has many Appointments', 'has one InsuranceCoverage'],
        sqlSnippet: `patients(id uuid PK, mrn text UNIQUE, first_name text, last_name text, date_of_birth date, gender text, blood_type text, emergency_contact_id uuid FK, insurance_coverage_id uuid FK, created_at timestamptz, updated_at timestamptz)`,
      },
      {
        name: 'Encounter',
        description: 'A clinical interaction between patient and practitioner (visit, admission, telehealth)',
        keyFields: ['patient_id', 'practitioner_id', 'encounter_type', 'status', 'started_at', 'ended_at', 'facility_id', 'notes_encrypted'],
        relationships: ['belongs to Patient', 'belongs to Practitioner', 'has many Observations', 'has many Procedures'],
        sqlSnippet: `encounters(id uuid PK, patient_id uuid FK, practitioner_id uuid FK, type text CHECK, status text CHECK, started_at timestamptz, ended_at timestamptz, facility_id uuid FK, notes_encrypted text, created_at timestamptz)`,
      },
      {
        name: 'Observation',
        description: 'Clinical measurement or finding (vitals, lab results, diagnostic notes)',
        keyFields: ['encounter_id', 'code', 'system', 'value_quantity', 'value_unit', 'interpretation', 'effective_at'],
        relationships: ['belongs to Encounter'],
        sqlSnippet: `observations(id uuid PK, encounter_id uuid FK, code text, system text, value_quantity decimal, value_unit text, interpretation text, effective_at timestamptz, created_at timestamptz)`,
      },
      {
        name: 'Medication',
        description: 'Prescribed or administered medication record',
        keyFields: ['patient_id', 'drug_code', 'dosage', 'frequency', 'prescriber_id', 'status', 'start_date', 'end_date'],
        relationships: ['belongs to Patient', 'prescribed by Practitioner'],
      },
      {
        name: 'Practitioner',
        description: 'Healthcare provider (doctor, nurse, specialist)',
        keyFields: ['npi', 'first_name', 'last_name', 'specialty', 'license_number', 'facility_id'],
        relationships: ['has many Encounters', 'belongs to Facility'],
      },
      {
        name: 'Appointment',
        description: 'Scheduled future encounter between patient and practitioner',
        keyFields: ['patient_id', 'practitioner_id', 'start_time', 'end_time', 'status', 'room', 'appointment_type'],
        relationships: ['belongs to Patient', 'belongs to Practitioner', 'may create Encounter'],
      },
      {
        name: 'InsuranceClaim',
        description: 'Billing claim submitted to insurance payer',
        keyFields: ['encounter_id', 'payer_id', 'amount', 'status', 'submitted_at', 'adjudicated_at', 'denial_reason'],
        relationships: ['belongs to Encounter', 'belongs to Payer'],
      },
      {
        name: 'Coverage',
        description: 'Patient insurance coverage details',
        keyFields: ['patient_id', 'payer_id', 'plan_name', 'member_id', 'group_number', 'effective_start', 'effective_end'],
        relationships: ['belongs to Patient', 'belongs to Payer'],
      },
    ],
    complianceRequirements: [
      'HIPAA: Encrypt all PHI at rest (AES-256) and in transit (TLS 1.3)',
      'HIPAA: Maintain audit logs for minimum 6 years',
      'HIPAA: Enforce minimum necessary access principle',
      'HIPAA: BAA required with all vendors handling PHI',
      'HIPAA: Automatic session timeout after 15 minutes of inactivity',
      'HIPAA: Data residency in approved regions only',
    ],
    apiPatterns: [
      'GET /patients/{id} — full patient record',
      'GET /patients/{id}/encounters?date=ge2026-01-01 — encounter history',
      'POST /encounters/{id}/observations — add clinical observation',
      'GET /patients/{id}/medications — active medication list',
      'POST /claims — submit insurance claim',
      'All patient endpoints require consent verification middleware',
      'Audit log on every PHI access (who, what, when, why)',
    ],
  },

  fintech: {
    industry: 'fintech',
    entities: [
      {
        name: 'Account',
        description: 'Financial account (checking, savings, investment, credit)',
        keyFields: ['holder_id', 'account_type', 'currency', 'status', 'opened_at', 'closed_at'],
        relationships: ['belongs to AccountHolder', 'has many LedgerEntries', 'has many Transactions'],
        sqlSnippet: `accounts(id uuid PK, holder_id uuid FK, type text CHECK, currency char(3), status text CHECK, opened_at timestamptz, closed_at timestamptz, created_at timestamptz)`,
      },
      {
        name: 'Transaction',
        description: 'Financial transaction (transfer, payment, deposit, withdrawal)',
        keyFields: ['reference', 'type', 'status', 'amount', 'currency', 'initiated_at', 'completed_at', 'metadata'],
        relationships: ['creates LedgerEntries (exactly 2: debit + credit)'],
        sqlSnippet: `transactions(id uuid PK, reference text UNIQUE, type text CHECK, status text CHECK, amount decimal(12,2), currency char(3), initiated_at timestamptz, completed_at timestamptz, metadata jsonb, created_at timestamptz)`,
      },
      {
        name: 'LedgerEntry',
        description: 'Double-entry bookkeeping record — every transaction produces exactly 2 entries',
        keyFields: ['transaction_id', 'account_id', 'amount', 'direction', 'balance_after'],
        relationships: ['belongs to Transaction', 'belongs to Account'],
        sqlSnippet: `ledger_entries(id uuid PK, transaction_id uuid FK, account_id uuid FK, amount decimal(12,2), direction text CHECK('debit','credit'), balance_after decimal(12,2), created_at timestamptz)`,
      },
      {
        name: 'Instrument',
        description: 'Payment method (card, bank account, wallet)',
        keyFields: ['holder_id', 'type', 'last_four', 'expiry', 'is_default', 'tokenized_data'],
        relationships: ['belongs to AccountHolder'],
      },
      {
        name: 'KYCRecord',
        description: 'Know Your Customer verification record',
        keyFields: ['holder_id', 'verification_type', 'status', 'submitted_at', 'verified_at', 'rejection_reason'],
        relationships: ['belongs to AccountHolder'],
      },
      {
        name: 'Statement',
        description: 'Monthly account statement',
        keyFields: ['account_id', 'period_start', 'period_end', 'opening_balance', 'closing_balance', 'generated_at'],
        relationships: ['belongs to Account'],
      },
    ],
    complianceRequirements: [
      'PCI-DSS: Never store full card numbers — tokenize via payment processor',
      'PCI-DSS: Encrypt cardholder data in transit (TLS 1.3)',
      'PCI-DSS: Quarterly vulnerability scans',
      'PCI-DSS: Network segmentation for cardholder data environment',
      'PCI-DSS: 90-day log retention minimum',
      'SOX: Audit trail for all financial transactions',
      'AML: Transaction monitoring for suspicious activity patterns',
    ],
    apiPatterns: [
      'POST /accounts/{id}/transactions — create transaction (idempotent via idempotency-key header)',
      'GET /accounts/{id}/statements?period=2026-01 — monthly statement',
      'POST /kyc/verifications — async KYC check (returns verification_id, poll for result)',
      'GET /accounts/{id}/balance — real-time balance',
      'POST /transfers — initiate fund transfer between accounts',
      'All financial endpoints require idempotency keys',
      'Double-entry validation: sum of all ledger entries must equal zero',
    ],
  },

  'e-commerce': {
    industry: 'general',
    entities: [
      {
        name: 'Product',
        description: 'Catalog item available for purchase',
        keyFields: ['sku', 'name', 'type', 'status', 'base_price', 'currency', 'category_id', 'description'],
        relationships: ['has many ProductVariants', 'belongs to Category', 'has many Reviews'],
        sqlSnippet: `products(id uuid PK, sku text UNIQUE, name text, type text, status text CHECK, base_price decimal(10,2), currency char(3), category_id uuid FK, description text, created_at timestamptz, updated_at timestamptz)`,
      },
      {
        name: 'ProductVariant',
        description: 'Size/color/material variation of a product with independent inventory',
        keyFields: ['product_id', 'attributes', 'sku', 'price_override', 'inventory_count'],
        relationships: ['belongs to Product', 'referenced by OrderItems'],
        sqlSnippet: `product_variants(id uuid PK, product_id uuid FK, attributes jsonb, sku text UNIQUE, price_override decimal(10,2), inventory_count integer DEFAULT 0, created_at timestamptz)`,
      },
      {
        name: 'Order',
        description: 'Customer purchase containing one or more items',
        keyFields: ['buyer_id', 'status', 'subtotal', 'tax', 'shipping', 'total', 'currency', 'placed_at'],
        relationships: ['belongs to Customer', 'has many OrderItems', 'has one Payment'],
        sqlSnippet: `orders(id uuid PK, buyer_id uuid FK, status text CHECK, subtotal decimal(10,2), tax decimal(10,2), shipping decimal(10,2), total decimal(10,2), currency char(3), placed_at timestamptz, created_at timestamptz)`,
      },
      {
        name: 'OrderItem',
        description: 'Individual line item within an order',
        keyFields: ['order_id', 'product_variant_id', 'quantity', 'unit_price', 'total'],
        relationships: ['belongs to Order', 'references ProductVariant'],
      },
      {
        name: 'Cart',
        description: 'Temporary collection of items before checkout',
        keyFields: ['customer_id', 'status', 'expires_at'],
        relationships: ['belongs to Customer', 'has many CartItems'],
      },
      {
        name: 'Promotion',
        description: 'Discount code or automatic promotion',
        keyFields: ['code', 'type', 'value', 'min_purchase', 'starts_at', 'expires_at', 'max_uses', 'current_uses'],
        relationships: ['applied to Orders'],
        sqlSnippet: `promotions(id uuid PK, code text UNIQUE, type text CHECK('percentage','fixed','free_shipping'), value decimal(10,2), min_purchase decimal(10,2), starts_at timestamptz, expires_at timestamptz, max_uses integer, current_uses integer DEFAULT 0)`,
      },
      {
        name: 'Review',
        description: 'Customer product review with rating',
        keyFields: ['product_id', 'customer_id', 'rating', 'title', 'body', 'verified_purchase'],
        relationships: ['belongs to Product', 'belongs to Customer'],
      },
    ],
    complianceRequirements: [
      'PCI-DSS: Tokenize payment data — never store raw card numbers',
      'GDPR: Right-to-erasure for customer data',
      'Tax compliance: Calculate and collect sales tax per jurisdiction',
    ],
    apiPatterns: [
      'GET /products?category=shoes&sort=price&cursor=... — faceted search',
      'POST /carts/{id}/items — add item to cart',
      'POST /orders — create order from cart (atomic: inventory decrement + payment + order creation)',
      'POST /orders/{id}/returns — initiate return',
      'GET /orders/{id}/tracking — shipment tracking',
    ],
  },

  education: {
    industry: 'education',
    entities: [
      {
        name: 'Course',
        description: 'Educational course or program',
        keyFields: ['title', 'description', 'instructor_id', 'status', 'start_date', 'end_date', 'max_enrollment'],
        relationships: ['belongs to Instructor', 'has many Modules', 'has many Enrollments'],
      },
      {
        name: 'Module',
        description: 'Unit or section within a course containing lessons',
        keyFields: ['course_id', 'title', 'order', 'duration_minutes'],
        relationships: ['belongs to Course', 'has many Lessons'],
      },
      {
        name: 'Lesson',
        description: 'Individual learning unit (video, reading, activity)',
        keyFields: ['module_id', 'title', 'type', 'content_url', 'duration_minutes', 'order'],
        relationships: ['belongs to Module'],
      },
      {
        name: 'Enrollment',
        description: 'Student registration in a course',
        keyFields: ['student_id', 'course_id', 'status', 'enrolled_at', 'completed_at', 'grade'],
        relationships: ['belongs to Student', 'belongs to Course'],
      },
      {
        name: 'Assessment',
        description: 'Quiz, exam, or assignment',
        keyFields: ['course_id', 'title', 'type', 'max_score', 'due_date', 'weight'],
        relationships: ['belongs to Course', 'has many Submissions'],
      },
      {
        name: 'Submission',
        description: 'Student work submitted for an assessment',
        keyFields: ['assessment_id', 'student_id', 'content', 'score', 'feedback', 'submitted_at', 'graded_at'],
        relationships: ['belongs to Assessment', 'belongs to Student'],
      },
      {
        name: 'Progress',
        description: 'Student progress tracking per lesson',
        keyFields: ['student_id', 'lesson_id', 'status', 'started_at', 'completed_at', 'time_spent_seconds'],
        relationships: ['belongs to Student', 'belongs to Lesson'],
      },
    ],
    complianceRequirements: [
      'FERPA: Protect student education records',
      'COPPA: Parental consent for students under 13',
      'Accessibility: WCAG 2.2 AA for all learning content',
    ],
    apiPatterns: [
      'GET /courses/{id}/modules — course structure',
      'POST /enrollments — enroll student',
      'GET /students/{id}/progress — learning progress dashboard',
      'POST /assessments/{id}/submissions — submit work',
      'PATCH /submissions/{id}/grade — instructor grades submission',
    ],
  },

  'real-estate': {
    industry: 'real-estate',
    entities: [
      {
        name: 'Property',
        description: 'Real estate property (residential, commercial)',
        keyFields: ['address', 'type', 'status', 'bedrooms', 'bathrooms', 'square_feet', 'year_built', 'lot_size'],
        relationships: ['has many Listings', 'has many Inspections'],
      },
      {
        name: 'Listing',
        description: 'Property listing on the market',
        keyFields: ['property_id', 'agent_id', 'price', 'status', 'listing_type', 'listed_at', 'expires_at'],
        relationships: ['belongs to Property', 'belongs to Agent', 'has many Showings', 'has many Offers'],
      },
      {
        name: 'Agent',
        description: 'Real estate agent or broker',
        keyFields: ['name', 'license_number', 'brokerage_id', 'email', 'phone', 'specialty'],
        relationships: ['has many Listings', 'belongs to Brokerage'],
      },
      {
        name: 'Offer',
        description: 'Purchase offer on a listing',
        keyFields: ['listing_id', 'buyer_id', 'amount', 'status', 'contingencies', 'submitted_at', 'expires_at'],
        relationships: ['belongs to Listing', 'belongs to Buyer'],
      },
      {
        name: 'Showing',
        description: 'Property showing appointment',
        keyFields: ['listing_id', 'buyer_id', 'agent_id', 'scheduled_at', 'status', 'feedback'],
        relationships: ['belongs to Listing'],
      },
      {
        name: 'Inspection',
        description: 'Property inspection report',
        keyFields: ['property_id', 'inspector_id', 'type', 'findings', 'completed_at'],
        relationships: ['belongs to Property'],
      },
    ],
    complianceRequirements: [
      'Fair Housing Act: No discriminatory listing or filtering',
      'RESPA: Disclosure requirements for closing costs',
      'State licensing: Verify agent license numbers',
    ],
    apiPatterns: [
      'GET /listings?city=austin&min_price=200000&bedrooms=3 — property search',
      'POST /listings/{id}/showings — schedule showing',
      'POST /listings/{id}/offers — submit offer',
      'GET /properties/{id}/history — ownership and listing history',
    ],
  },

  automotive: {
    industry: 'automotive',
    entities: [
      {
        name: 'Vehicle',
        description: 'Vehicle record (new or used inventory)',
        keyFields: ['vin', 'make', 'model', 'year', 'trim', 'color', 'mileage', 'status', 'dealer_id'],
        relationships: ['belongs to Dealer', 'has many ServiceAppointments', 'has one Warranty'],
        sqlSnippet: `vehicles(id uuid PK, vin char(17) UNIQUE, make text, model text, year integer, trim text, color text, mileage integer, status text CHECK, dealer_id uuid FK, created_at timestamptz, updated_at timestamptz)`,
      },
      {
        name: 'Customer',
        description: 'Vehicle buyer or service customer',
        keyFields: ['type', 'first_name', 'last_name', 'email', 'phone', 'preferred_dealer_id'],
        relationships: ['has many FinancialAccounts', 'has many ServiceAppointments'],
      },
      {
        name: 'Dealer',
        description: 'Dealership location',
        keyFields: ['name', 'address', 'type', 'franchise_brand', 'license_number'],
        relationships: ['has many Vehicles', 'has many Employees'],
      },
      {
        name: 'FinancialAccount',
        description: 'Financing or lease agreement for a vehicle',
        keyFields: ['customer_id', 'vehicle_id', 'type', 'principal', 'rate', 'term_months', 'monthly_payment', 'status'],
        relationships: ['belongs to Customer', 'belongs to Vehicle'],
        sqlSnippet: `financial_accounts(id uuid PK, customer_id uuid FK, vehicle_id uuid FK, type text CHECK('finance','lease'), principal decimal(10,2), rate decimal(5,4), term_months integer, monthly_payment decimal(10,2), status text CHECK, created_at timestamptz)`,
      },
      {
        name: 'Warranty',
        description: 'Vehicle warranty coverage',
        keyFields: ['vehicle_id', 'type', 'coverage_start', 'coverage_end', 'deductible', 'status'],
        relationships: ['belongs to Vehicle'],
      },
      {
        name: 'ServiceAppointment',
        description: 'Vehicle service or maintenance appointment',
        keyFields: ['vehicle_id', 'customer_id', 'dealer_id', 'type', 'status', 'scheduled_at', 'completed_at'],
        relationships: ['belongs to Vehicle', 'belongs to Customer', 'belongs to Dealer'],
      },
    ],
    complianceRequirements: [
      'Lemon law: Track repair history per vehicle for warranty claims',
      'Emissions: Record emissions test results where required by state',
      'TILA: Truth in Lending disclosures for financing agreements',
    ],
    apiPatterns: [
      'GET /vehicles?make=toyota&year_min=2024&status=available — inventory search',
      'POST /vehicles/{vin}/service-appointments — schedule service',
      'GET /customers/{id}/vehicles — customer vehicle history',
      'POST /financial-accounts — create financing/lease agreement',
    ],
  },
};

/**
 * Get entity catalog for a specific industry.
 * Returns undefined for 'general' or unknown industries.
 */
export function getIndustryEntities(
  industry: string | undefined,
): IndustryEntityCatalog | undefined {
  if (!industry || industry === 'general') return undefined;
  return industryPatterns[industry];
}
