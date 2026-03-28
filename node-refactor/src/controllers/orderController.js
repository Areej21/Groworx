/**
 * Order route handlers (controllers).
 * Thin layer: validates input, delegates to service, returns responses.
 */
const { validateOrder, sanitiseOrder } = require("../validators/orderValidator");
const orderService = require("../services/orderService");

/**
 * POST /validate
 * Validates and stores an order.
 */
function postValidate(req, res, next) {
  try {
    const errors = validateOrder(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ status: "error", errors });
    }

    const orderId = String(req.body.order_id).trim();
    if (orderService.exists(orderId)) {
      return res.status(409).json({
        status: "error",
        errors: [`duplicate order: order_id '${orderId}' already exists`],
      });
    }

    const stored = orderService.save(sanitiseOrder(req.body));
    return res.status(201).json({ status: "ok", message: "Order validated and stored", order: stored });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders
 * Returns all stored orders.
 */
function getOrders(req, res, next) {
  try {
    return res.status(200).json(orderService.findAll());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders/:id
 * Returns a single order by order_id.
 */
function getOrderById(req, res, next) {
  try {
    const order = orderService.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: `Order '${req.params.id}' not found` });
    }
    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { postValidate, getOrders, getOrderById };
