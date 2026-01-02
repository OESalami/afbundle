import Order from "../models/Order.js";
import Package from "../models/Package.js";
import Network from "../models/Network.js";
import { sendSMS } from "../utils/sendSMS.js";
import { formatGhanaNumber } from "../utils/formatPhone.js";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Generate unique order ID (shorter format)
const generateOrderId = () => {
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${random}`;
};

// Verify Paystack transaction (async, non-blocking)
const verifyPaystackTransaction = async (reference) => {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Paystack API error:", error);
    return { status: false, message: error.message };
  }
};

// Async verification function (runs in background, logs results)
const performAsyncVerification = async (order, pkg, reference) => {
  try {
    console.log(`\n${"=".repeat(60)}`);
    console.log(
      `[VERIFICATION START] Order: ${order.orderId}, Reference: ${reference}`
    );
    console.log(`${"=".repeat(60)}`);

    // Verify with Paystack
    const paystackResponse = await verifyPaystackTransaction(reference);

    // Check if transaction was successful
    if (
      !paystackResponse.status ||
      paystackResponse.data?.status !== "success"
    ) {
      console.log(
        `[VERIFICATION FAILED] Order: ${order.orderId} - Transaction not successful`
      );
      console.log(
        `  Reason: ${
          paystackResponse.message ||
          paystackResponse.data?.gateway_response ||
          "Unknown"
        }`
      );
      return;
    }

    // Extract metadata from Paystack response
    const metadata = paystackResponse.data.metadata || {};
    const paystackTransactionId = paystackResponse.data.id;

    console.log(`[METADATA FROM PAYSTACK]`);
    console.log(`  Package ID: ${metadata.packageId || "N/A"}`);
    console.log(`  Package Title: ${metadata.packageTitle || "N/A"}`);
    console.log(`  Phone Number: ${metadata.phoneNumber || "N/A"}`);
    console.log(`  Network: ${metadata.networkName || "N/A"}`);
    console.log(`  Size: ${metadata.sizeGb || "N/A"}GB`);

    // ===== PRICE COMPARISON =====
    const paidAmount = paystackResponse.data.amount / 100; // Convert pesewas to GHS
    const expectedAmount = pkg.price;

    console.log(`\n[PRICE COMPARISON]`);
    console.log(`  Expected Price (from DB): GH₵${expectedAmount}`);
    console.log(`  Paid Amount (from Paystack): GH₵${paidAmount}`);

    if (paidAmount === expectedAmount) {
      console.log(`  ✅ PRICE MATCH - Amount paid matches expected price`);
    } else if (paidAmount > expectedAmount) {
      console.log(
        `  ⚠️ OVERPAID - Customer paid GH₵${(
          paidAmount - expectedAmount
        ).toFixed(2)} extra`
      );
    } else {
      console.log(
        `  ❌ UNDERPAID - Customer paid GH₵${(
          expectedAmount - paidAmount
        ).toFixed(2)} less than expected`
      );
      console.log(`  [SECURITY ALERT] Possible tampering detected!`);
    }

    // ===== PACKAGE ID VERIFICATION =====
    console.log(`\n[PACKAGE VERIFICATION]`);
    console.log(`  Expected Package (from DB): ${pkg.packageCode}`);
    console.log(
      `  Metadata Package (from Paystack): ${metadata.packageId || "N/A"}`
    );

    if (metadata.packageId === pkg.packageCode) {
      console.log(`  ✅ PACKAGE MATCH - Package ID verified`);
    } else {
      console.log(`  ❌ PACKAGE MISMATCH - Possible tampering!`);
    }

    // ===== PHONE NUMBER VERIFICATION =====
    console.log(`\n[PHONE VERIFICATION]`);
    console.log(`  Order Phone: ${order.phoneNumber}`);
    console.log(`  Metadata Phone: ${metadata.phoneNumber || "N/A"}`);

    if (metadata.phoneNumber === order.phoneNumber) {
      console.log(`  ✅ PHONE MATCH - Phone number verified`);
    } else {
      console.log(
        `  ⚠️ PHONE MISMATCH - May be intentional (buying for someone else)`
      );
    }

    // ===== FINAL VERDICT =====
    const priceOk = paidAmount >= expectedAmount;
    const packageOk =
      !metadata.packageId || metadata.packageId === pkg.packageCode;

    console.log(`\n[VERIFICATION RESULT]`);
    if (priceOk && packageOk) {
      console.log(`  ✅ VERIFICATION SUCCESS`);
      console.log(`  Order ID: ${order.orderId}`);
      console.log(`  Reference: ${reference}`);
      console.log(`  Paystack Transaction ID: ${paystackTransactionId}`);
      console.log(`  Amount: GH₵${paidAmount}`);
      console.log(`  Package: ${pkg.packageCode} (${pkg.title})`);
      console.log(`  Recipient: ${order.phoneNumber}`);
    } else {
      console.log(`  ❌ VERIFICATION FAILED`);
      console.log(`  Order ID: ${order.orderId}`);
      console.log(
        `  Issues: ${!priceOk ? "Underpaid" : ""} ${
          !packageOk ? "Package mismatch" : ""
        }`
      );
    }
    console.log(`${"=".repeat(60)}\n`);
  } catch (error) {
    console.error(`[VERIFICATION ERROR] Order: ${order.orderId}`, error);
  }
};

// @Arkesel SMS
const buildOrderSMS = ({ network, sizeGb, phone, orderId }) => {
  return `
Bundle purchase of ${network} - ${sizeGb}GB (${sizeGb}GB) to ${phone} will be delivered within 24hrs.
Order Number: ${orderId}.
For support, WhatsApp 0597975309
`.trim();
};

// @desc    Create order immediately (pending verification)
// @route   POST /api/payments/create-order
// @access  Public
export const createOrderInstant = async (req, res) => {
  try {
    const { reference, packageId, phoneNumber, email, amountPaid, agentPhone } =
      req.body;

    console.log("[CREATE ORDER] Received:", {
      reference,
      packageId,
      phoneNumber,
      email,
      amountPaid,
      agentPhone,
    });

    // Validate required fields
    if (!reference || !packageId || !phoneNumber) {
      console.log("[CREATE ORDER] Missing required fields");
      return res.status(400).json({
        error: "Reference, package ID, and phone number are required",
      });
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      console.log("[CREATE ORDER] Invalid phone number format:", phoneNumber);
      return res.status(400).json({
        error: "Phone number must be 10 digits",
      });
    }

    // Check if order with this reference already exists (prevent duplicates)
    const existingOrder = await Order.findOne({ paystackReference: reference });
    if (existingOrder) {
      // Return existing order instead of error (idempotent)
      const populatedOrder = await Order.findById(existingOrder._id)
        .populate("network", "name slug")
        .populate("package", "title sizeGb price");

      // ================= SEND SMS =================
      const localPhone = phoneNumber; // 0591093564
      const intlPhone = formatGhanaNumber(phoneNumber);

      const smsMessage = buildOrderSMS({
        network: populatedOrder.network.name,
        sizeGb: populatedOrder.package.sizeGb,
        phone: localPhone,
        orderId: populatedOrder.orderId,
      });

      // Fire-and-forget (non-blocking)
      setImmediate(() => {
        sendSMS({
          to: intlPhone,
          message: smsMessage,
        });
      });

      return res.status(200).json({
        success: true,
        message: "Order already exists",
        order: {
          id: populatedOrder._id,
          orderId: populatedOrder.orderId,
          networkName: populatedOrder.network?.name,
          networkSlug: populatedOrder.network?.slug,
          packageTitle: populatedOrder.package?.title,
          sizeGb: populatedOrder.package?.sizeGb,
          phoneNumber: populatedOrder.phoneNumber,
          amount: populatedOrder.amount,
          paymentStatus: populatedOrder.paymentStatus,
          deliveryStatus: populatedOrder.deliveryStatus,
          paystackReference: populatedOrder.paystackReference,
          createdAt: populatedOrder.createdAt,
        },
      });
    }

    // Get package from database
    const pkg = await Package.findOne({ packageCode: packageId, active: true });
    if (!pkg) {
      return res.status(404).json({
        error: "Package not found or inactive",
      });
    }

    // Get network
    const network = await Network.findById(pkg.network);
    if (!network || !network.active) {
      return res.status(404).json({
        error: "Network not found or inactive",
      });
    }

    // Create order immediately with "pending" verification status
    // Payment is assumed successful since Paystack callback was triggered
    const order = await Order.create({
      orderId: generateOrderId(),
      network: network._id,
      package: pkg._id,
      packageCode: pkg.packageCode,
      phoneNumber,
      agentPhone: agentPhone || null, // Track which agent placed the order
      amount: pkg.price,
      paymentStatus: "paid", // Paystack success callback means payment went through
      deliveryStatus: "processing",
      paystackReference: reference,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("network", "name slug")
      .populate("package", "title sizeGb price");

    // Trigger async verification (non-blocking)
    // This runs in the background and logs results
    setImmediate(() => {
      performAsyncVerification(order, pkg, reference);
    });

    // Return immediately to user
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: populatedOrder._id,
        orderId: populatedOrder.orderId,
        networkName: populatedOrder.network.name,
        networkSlug: populatedOrder.network.slug,
        packageTitle: populatedOrder.package.title,
        sizeGb: populatedOrder.package.sizeGb,
        phoneNumber: populatedOrder.phoneNumber,
        agentPhone: populatedOrder.agentPhone,
        amount: populatedOrder.amount,
        paymentStatus: populatedOrder.paymentStatus,
        deliveryStatus: populatedOrder.deliveryStatus,
        paystackReference: populatedOrder.paystackReference,
        createdAt: populatedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// @desc    Paystack Webhook handler (backup verification)
// @route   POST /api/payments/webhook
// @access  Public (verified by Paystack signature)
export const paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("[WEBHOOK] Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log(`[WEBHOOK] Received event: ${event.event}`);

    // Handle successful charge
    if (event.event === "charge.success") {
      const { reference, amount, metadata } = event.data;

      console.log(`[WEBHOOK] charge.success for reference: ${reference}`);
      console.log(`[WEBHOOK] Amount: ${amount / 100} GHS`);
      console.log(`[WEBHOOK] Metadata:`, JSON.stringify(metadata, null, 2));

      // Check if order exists with this reference
      const existingOrder = await Order.findOne({
        paystackReference: reference,
      });

      if (existingOrder) {
        console.log(`[WEBHOOK] Order found: ${existingOrder.orderId}`);
        console.log(
          `[WEBHOOK] Current status - Payment: ${existingOrder.paymentStatus}, Delivery: ${existingOrder.deliveryStatus}`
        );
      } else {
        console.log(`[WEBHOOK] No order found for reference: ${reference}`);
        console.log(
          `[WEBHOOK] This may indicate the frontend hasn't created the order yet`
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK] Error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// @desc    Initialize payment (get Paystack payment data)
// @route   POST /api/payments/initialize
// @access  Public
export const initializePayment = async (req, res) => {
  try {
    const { packageId, phoneNumber, email } = req.body;

    if (!packageId || !phoneNumber || !email) {
      return res.status(400).json({
        error: "Package ID, phone number, and email are required",
      });
    }

    // Get package details for the amount
    const pkg = await Package.findOne({ packageCode: packageId, active: true });
    if (!pkg) {
      return res.status(404).json({ error: "Package not found or inactive" });
    }

    const network = await Network.findById(pkg.network);
    if (!network || !network.active) {
      return res.status(404).json({ error: "Network not found or inactive" });
    }

    // Return data needed for Paystack popup
    res.json({
      success: true,
      paymentData: {
        amount: pkg.price * 100, // Paystack expects pesewas (GHS smallest unit)
        email: email,
        metadata: {
          packageId: pkg.packageCode,
          packageTitle: pkg.title,
          networkName: network.name,
          phoneNumber: phoneNumber,
          sizeGb: pkg.sizeGb,
        },
      },
    });
  } catch (error) {
    console.error("Initialize payment error:", error);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
};
