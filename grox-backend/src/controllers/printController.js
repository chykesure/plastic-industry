// src/controllers/salesController.js
import Sale from "../models/Sale.js";


import escpos from "escpos";
import USB from "escpos-usb";

// 🔢 Fetch sale by invoice number
export const getSaleByInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const sale = await Sale.findOne({ invoiceNumber });

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sale" });
  }
};

// 🖨 Print receipt via ESC/POS to Xprinter
export const printReceipt = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const sale = await Sale.findOne({ invoiceNumber });

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Initialize printer
    const device = new USB(); // auto-detect first USB printer
    const printer = new escpos.Printer(device);

    device.open((err) => {
      if (err) {
        console.error("Printer connection failed:", err);
        return res.status(500).json({ message: "Printer connection failed" });
      }

      // Format receipt
      printer
        .align("CT")
        .text("Grox Shopping Store")
        .text("B338 Imo-Akure Road, Ilesha, Osun State")
        .text(new Date().toLocaleString())
        .drawLine()
        .align("LT")
        .text(`Invoice #: ${sale.invoiceNumber}`)
        .text(`Cashier: ${sale.cashier}`)
        .drawLine()
        .tableCustom(
          sale.items.map((item, idx) => ({
            text: `${idx + 1}. ${item.productName}`,
            align: "LEFT",
            width: 0.6,
            cols: [
              { text: `${item.quantity}`, align: "CENTER", width: 0.1 },
              { text: `₦${item.price.toFixed(2)}`, align: "RIGHT", width: 0.15 },
              { text: `₦${(item.price * item.quantity).toFixed(2)}`, align: "RIGHT", width: 0.15 },
            ],
          }))
        )
        .drawLine()
        .align("RT")
        .text(`Total: ₦${sale.total.toFixed(2)}`)
        .text(`Payment: ${sale.paymentMode}`)
        .text("Thank you for shopping with us!")
        .cut()
        .close();

      res.json({ message: "Receipt sent to printer" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to print receipt" });
  }
};
