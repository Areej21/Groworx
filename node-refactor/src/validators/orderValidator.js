/**
 * Order validation logic.
 * Pure functions — no Express dependencies, easy to unit-test in isolation.
 */

/**
 * Validate a single line item.
 * Returns an array of error strings (empty = valid).
 */
function validateItem(item, index) {
  const errors = [];
  if (!item || typeof item !== "object") {
    errors.push(`items[${index}] must be an object`);
    return errors;
  }
  if (!item.sku || typeof item.sku !== "string" || !item.sku.trim()) {
    errors.push(`items[${index}].sku is required and must be a non-empty string`);
  }
  if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0) {
    errors.push(`items[${index}].quantity must be a positive integer`);
  }
  if (typeof item.price !== "number" || item.price < 0) {
    errors.push(`items[${index}].price must be a non-negative number`);
  }
  return errors;
}

/**
 * Validate a complete order object.
 * Returns an array of error strings. An empty array means the order is valid.
 */
function validateOrder(body) {
  // Guard against missing or non-object body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["request body must be a JSON object"];
  }

  const errors = [];

  if (!body.order_id || typeof body.order_id !== "string" || !body.order_id.trim()) {
    errors.push("order_id is required and must be a non-empty string");
  }

  if (!Array.isArray(body.items)) {
    errors.push("items must be an array");
  } else if (body.items.length === 0) {
    errors.push("items must not be empty");
  } else {
    body.items.forEach((item, i) => {
      errors.push(...validateItem(item, i));
    });
  }

  if (typeof body.total !== "number") {
    errors.push("total must be a number");
  } else if (body.total < 0) {
    errors.push("total cannot be negative");
  }

  return errors;
}

/**
 * Extract and whitelist only the fields we want to store.
 * Discards any extra or injected fields from the caller.
 */
function sanitiseOrder(body) {
  return {
    order_id: String(body.order_id).trim(),
    items: body.items.map((item) => ({
      sku: String(item.sku).trim(),
      quantity: item.quantity,
      price: item.price,
    })),
    total: body.total,
  };
}

module.exports = { validateOrder, sanitiseOrder, validateItem };
