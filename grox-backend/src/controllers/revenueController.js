import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// --------------------
// SAFE DATE HELPERS
// --------------------
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// --------------------
// MAIN CONTROLLER
// --------------------
export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let rangeStart = null;
    let rangeEnd = null;

    if (startDate && endDate) {
      rangeStart = startOfDay(new Date(startDate));
      rangeEnd = endOfDay(new Date(endDate));
    }

    // --------------------
    // FETCH SALES
    // --------------------
    const saleQuery = {
      status: { $in: ["completed", "partially returned"] },
    };

    if (rangeStart && rangeEnd) {
      saleQuery.date = { $gte: rangeStart, $lte: rangeEnd };
    }

    const sales = await Sale.find(saleQuery);

    // --------------------
    // LOAD PRODUCT COSTS
    // --------------------
    const products = await Product.find();
    const productMap = {};

    products.forEach((p) => {
      productMap[p._id.toString()] = Number(p.costPrice) || 0;
    });

    // --------------------
    // CALCULATE TOTALS
    // --------------------
    let totalSales = 0;     // Gross sales (before returns)
    let totalCost = 0;      // Cost of net sold items
    let totalReturns = 0;   // Value of returned items

    sales.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const soldQty = Number(item.quantity) || 0;
        const returnedQty = Number(item.returnedQty) || 0; // MUST exist or be 0
        const netQty = soldQty - returnedQty;

        const sellPrice = Number(item.price) || 0;
        const costPrice = productMap[item.productId.toString()] || 0;

        // 1. Gross Sales
        totalSales += sellPrice * soldQty;

        // 2. Cost (only for items not returned)
        totalCost += costPrice * netQty;

        // 3. Returns value
        totalReturns += sellPrice * returnedQty;
      });
    });

    const netSales = totalSales - totalReturns;
    const grossProfit = netSales - totalCost; // Adjusted for standard accounting (gross profit after returns)
    const netProfit = grossProfit; // Assuming no other expenses; same as gross profit here

    // --------------------
    // RESPONSE
    // --------------------
    res.json({
      range: {
        startDate: startDate || "all",
        endDate: endDate || "all",
      },
      totals: {
        sales: Number(totalSales.toFixed(2)),
        cost: Number(totalCost.toFixed(2)),
        returns: Number(totalReturns.toFixed(2)),
        netSales: Number(netSales.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)), // Added for clarity
        netProfit: Number(netProfit.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Revenue Report Error:", error);
    res.status(500).json({ message: "Failed to generate revenue report" });
  }
};