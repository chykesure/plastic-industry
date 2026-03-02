import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const getTopProducts = async (req, res) => {
  try {
    // Aggregate top products by quantity sold & revenue
    const topProductsAgg = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          qtySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Populate product info + category name
    const topProducts = await Promise.all(
      topProductsAgg.map(async (item) => {
        const product = await Product.findById(item._id).select("name category");
        let categoryName = "-";

        if (product?.category) {
          const category = await Category.findById(product.category).select("name");
          categoryName = category?.name || "-";
        }

        return {
          _id: item._id,
          productName: product?.name || "-",
          category: categoryName,
          qtySold: item.qtySold,
          revenue: item.revenue,
        };
      })
    );

    res.json(topProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top products", error: err.message });
  }
};
