import express from "express";
import cors from "cors";
import escpos from "escpos";
import escposUsb from "escpos-usb";

escpos.USB = escposUsb;

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/print-receipt", async (req, res) => {
  const {
    storeName = "Store Name",
    phoneNumber = "N/A",
    address = "No Address Provided",
    items = [],
    totalPrice = 0,
    cash = 0,
    exchange = 0,
    dateTime = new Date().toLocaleString(),
    thankYouMessage = "Thank you for shopping!",
  } = req.body;

  // Validate items array
  if (
    !Array.isArray(items) ||
    items.some((item) => !item.name || item.price == null)
  ) {
    return res.status(400).send("Invalid items provided");
  }

  const receiptContent = `
      ${storeName}
      ${phoneNumber}
      ${address}
      -----------------------------
      Items:
      ${items
        .map((item) => `${item.name} - PHP ${Number(item.price).toFixed(2)}`)
        .join("\n")}
      -----------------------------
      Total: PHP ${Number(totalPrice).toFixed(2)}
      Cash: PHP ${Number(cash).toFixed(2)}
      Exchange: PHP ${Number(exchange).toFixed(2)}
      -----------------------------
      ${dateTime}
      ${thankYouMessage}
    `;

  try {
    // Find connected printers
    const printers = escpos.USB.findPrinter();
    if (!printers.length) {
      console.error("No printers found.");
      return res.status(500).send("No printers connected.");
    }

    // Attempt to initialize the USB printer
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(() => {
      printer.text(receiptContent).cut().close();
      res.status(200).send("Receipt printed!");
    });
  } catch (error) {
    console.error("Printing failed:", error);

    if (error.message.includes("usb.on is not a function")) {
      console.error(
        "This error may indicate a version mismatch with escpos-usb. Try downgrading or ensuring USB library compatibility."
      );
    }

    res.status(500).send("Printing failed");
  }
});

app.listen(5174, () => {
  console.log("Server running on http://localhost:5174");
});
