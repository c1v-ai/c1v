/**
 * System Design Reference Examples
 *
 * Canonical patterns from well-known systems,
 * used to provide concrete examples in KB output.
 */

import type { SystemDesignExample } from './types';

export const systemDesignExamples: SystemDesignExample[] = [
  {
    name: 'Uber (Ride-Sharing)',
    category: 'marketplace',
    entities: [
      'User', 'Driver', 'Ride', 'RideRequest', 'Vehicle',
      'Payment', 'Rating', 'Location', 'Surge', 'Promotion',
    ],
    actors: ['Rider', 'Driver', 'Admin', 'Payment Gateway', 'Maps API', 'SMS/Push Service'],
    apiPatterns: [
      'POST /rides/request — rider requests ride',
      'PATCH /rides/{id}/accept — driver accepts',
      'GET /rides/{id}/track — real-time location (WebSocket)',
      'POST /rides/{id}/rate — post-ride rating',
      'GET /rides/{id}/receipt — trip receipt',
    ],
    concurrencyPatterns: [
      'Location updates: high-frequency writes (every 3-5s per active driver)',
      'Matching: nearest driver algorithm with concurrent request handling',
      'Surge pricing: real-time supply/demand calculation',
      'Payment: async capture after ride completion',
    ],
  },
  {
    name: 'Stripe (Payments)',
    category: 'api-platform',
    entities: [
      'Account', 'Customer', 'PaymentIntent', 'PaymentMethod',
      'Charge', 'Refund', 'Invoice', 'Subscription', 'Plan',
      'Webhook', 'Event', 'BalanceTransaction',
    ],
    actors: ['Merchant', 'Cardholder', 'Card Network', 'Banking Partner', 'Dashboard User', 'Webhook Consumer'],
    apiPatterns: [
      'POST /payment_intents — create intent (two-step: create then confirm)',
      'POST /payment_intents/{id}/confirm — confirm with payment method',
      'POST /refunds — refund a charge',
      'GET /events — list events (webhook replay)',
      'All mutations use idempotency keys',
    ],
    concurrencyPatterns: [
      'Idempotency: every mutation accepts idempotency-key header',
      'Event sourcing: all state changes produce Events',
      'Webhook delivery: at-least-once with exponential backoff',
      'Balance updates: eventually consistent with reconciliation',
    ],
  },
  {
    name: 'Netflix (Streaming)',
    category: 'b2c',
    entities: [
      'User', 'Profile', 'Content', 'Episode', 'Genre',
      'WatchHistory', 'Rating', 'Plan', 'Billing', 'Recommendation',
    ],
    actors: ['Viewer', 'Content Admin', 'CDN', 'Recommendation Engine', 'Encoding Pipeline', 'Billing System'],
    apiPatterns: [
      'GET /profiles/{id}/recommendations — personalized feed',
      'POST /watch-history — track viewing progress',
      'GET /content/{id}/stream — adaptive bitrate streaming URL',
      'GET /search?q=... — full-text content search',
    ],
    concurrencyPatterns: [
      'Parallel transcoding: 480p, 720p, 1080p, 4K simultaneously',
      'CDN edge caching: popular content pre-distributed globally',
      'Recommendation: offline batch compute + real-time re-ranking',
      'A/B testing: concurrent experiments across user segments',
    ],
  },
  {
    name: 'Slack (Messaging)',
    category: 'saas',
    entities: [
      'Workspace', 'User', 'Channel', 'Message', 'Thread',
      'Reaction', 'File', 'App', 'Webhook', 'Notification',
    ],
    actors: ['User', 'Bot/App', 'Admin', 'File Storage', 'Search Index', 'Push Service'],
    apiPatterns: [
      'POST /messages — send message (WebSocket for real-time)',
      'GET /channels/{id}/history — paginated message history',
      'POST /reactions — add emoji reaction',
      'GET /search?query=... — full-text message search',
      'POST /webhooks/incoming — external integration',
    ],
    concurrencyPatterns: [
      'Real-time: WebSocket connections per user, fan-out to channel members',
      'Message ordering: per-channel sequential consistency',
      'Search: async indexing with eventual consistency',
      'Presence: heartbeat-based online status tracking',
    ],
  },
  {
    name: 'Shopify (E-Commerce Platform)',
    category: 'marketplace',
    entities: [
      'Shop', 'Product', 'Variant', 'Collection', 'Customer',
      'Order', 'LineItem', 'Payment', 'Fulfillment', 'Refund',
      'Inventory', 'Theme', 'App',
    ],
    actors: ['Merchant', 'Buyer', 'Payment Gateway', 'Shipping Carrier', 'App Developer', 'Admin'],
    apiPatterns: [
      'GET /products — paginated product catalog (cursor-based)',
      'POST /orders — create order (atomic: inventory + payment)',
      'POST /orders/{id}/fulfillments — fulfill order',
      'POST /orders/{id}/refunds — process refund',
      'Webhooks for order.created, order.paid, order.fulfilled',
    ],
    concurrencyPatterns: [
      'Inventory: optimistic locking with conflict resolution',
      'Flash sales: queue-based order processing, inventory reservation',
      'Multi-location: inventory allocation across warehouses',
      'Webhook delivery: guaranteed at-least-once with retry',
    ],
  },
  {
    name: 'GitHub (Developer Platform)',
    category: 'saas',
    entities: [
      'User', 'Organization', 'Repository', 'Branch', 'Commit',
      'PullRequest', 'Issue', 'Comment', 'Review', 'Action',
      'Webhook', 'App', 'Token',
    ],
    actors: ['Developer', 'Org Admin', 'CI/CD Runner', 'Bot/App', 'Webhook Consumer'],
    apiPatterns: [
      'GET /repos/{owner}/{repo}/pulls — list PRs',
      'POST /repos/{owner}/{repo}/issues — create issue',
      'PATCH /repos/{owner}/{repo}/pulls/{id}/merge — merge PR',
      'GET /repos/{owner}/{repo}/actions/runs — CI status',
      'REST + GraphQL APIs available',
    ],
    concurrencyPatterns: [
      'Git: content-addressable storage, branch-based concurrency',
      'PR merge: optimistic with conflict detection',
      'CI/CD: parallel job execution with dependency graph',
      'Webhooks: event-driven architecture for integrations',
    ],
  },
  {
    name: 'Airbnb (Accommodation Marketplace)',
    category: 'marketplace',
    entities: [
      'Host', 'Guest', 'Listing', 'Booking', 'Review',
      'Payment', 'Payout', 'Message', 'Calendar', 'Amenity',
    ],
    actors: ['Host', 'Guest', 'Admin', 'Payment Processor', 'Maps API', 'Messaging Service'],
    apiPatterns: [
      'GET /listings?location=...&checkin=...&checkout=... — availability search',
      'POST /bookings — create booking (atomic: calendar block + payment hold)',
      'POST /bookings/{id}/confirm — host confirms',
      'POST /reviews — post-stay review (bidirectional)',
    ],
    concurrencyPatterns: [
      'Calendar availability: optimistic locking, double-booking prevention',
      'Search: geo-spatial queries with date-range availability filtering',
      'Pricing: dynamic pricing based on demand, season, local events',
      'Payouts: delayed release (after check-in confirmed)',
    ],
  },
];

/**
 * Get system design examples matching a project type.
 */
export function getDesignExamples(
  projectType: string | undefined,
): SystemDesignExample[] {
  if (!projectType) return systemDesignExamples.slice(0, 3); // Return top 3 as default
  return systemDesignExamples.filter(ex =>
    ex.category === projectType ||
    ex.category === 'marketplace' && projectType === 'marketplace' ||
    ex.category === 'saas' && projectType === 'saas' ||
    ex.category === 'api-platform' && projectType === 'api-platform'
  );
}
