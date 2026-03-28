/**
 * In-memory order store.
 * Extracted as a service so it can be swapped for a real database layer
 * without touching routes or controllers.
 *
 * NOTE: Storage is in-memory by design for this assessment. All data is
 * lost on restart. In production, replace this module with one that
 * persists to a database. This trade-off is documented in DECISIONS.md.
 */

const orders = [];

function findAll() {
  return [...orders]; // return a copy to prevent callers mutating the store
}

function findById(orderId) {
  return orders.find((o) => o.order_id === orderId) ?? null;
}

function exists(orderId) {
  return orders.some((o) => o.order_id === orderId);
}

function save(order) {
  orders.push(order);
  return order;
}

// For testing: allows tests to reset state between runs
function _reset() {
  orders.length = 0;
}

module.exports = { findAll, findById, exists, save, _reset };
