import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { StockMovement } from "@/models/StockMovement";
import { getUserFromRequest } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function POST(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportType, startDate, endDate } = await request.json();

    // Force Bangla language for all PDFs
    const lang = "bn";

    let html = "";
    const shopName = lang === "bn" ? "নয়ন হার্ডওয়্যার" : "Nayon Hardware";
    const currentDate = formatDate(new Date(), lang);

    // Generate HTML based on report type
    switch (reportType) {
      case "currentStock":
        html = await generateCurrentStockReport(lang, shopName, currentDate);
        break;
      case "sales":
        html = await generateSalesReport(
          lang,
          shopName,
          currentDate,
          startDate,
          endDate
        );
        break;
      case "stockMovement":
        html = await generateStockMovementReport(
          lang,
          shopName,
          currentDate,
          startDate,
          endDate
        );
        break;
      case "lowStock":
        html = await generateLowStockReport(lang, shopName, currentDate);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    // Return HTML (client will handle PDF generation or we can use a service)
    return NextResponse.json({
      success: true,
      html,
      reportType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Current Stock Report
async function generateCurrentStockReport(lang, shopName, currentDate) {
  const products = await Product.find(
    {},
    { sort: { category_bn: 1, name_bn: 1 } }
  );

  const title = lang === "bn" ? "বর্তমান স্টক রিপোর্ট" : "Current Stock Report";

  let rows = "";
  products.forEach((product, index) => {
    // Show both names if both exist
    let productName = "";
    if (product.name_bn && product.name_en) {
      productName = `${product.name_bn}<br/><small style="color: #666">${product.name_en}</small>`;
    } else {
      productName = product.name_bn || product.name_en;
    }

    rows += `
      <tr>
        <td>${index + 1}</td>
        <td>${productName}</td>
        <td>${product.category_bn || product.category_en}</td>
        <td>${product.brand || "-"}</td>
        <td>${product.partCode}</td>
        <td style="text-align: right">${product.stockQuantity}</td>
        <td style="text-align: right">${formatCurrency(
          product.sellingPrice,
          lang
        )}</td>
      </tr>
    `;
  });

  return generatePDFTemplate(
    lang,
    shopName,
    title,
    currentDate,
    `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${lang === "bn" ? "পণ্যের নাম" : "Product Name"}</th>
          <th>${lang === "bn" ? "ক্যাটাগরি" : "Category"}</th>
          <th>${lang === "bn" ? "ব্র্যান্ড" : "Brand"}</th>
          <th>${lang === "bn" ? "পার্ট কোড" : "Part Code"}</th>
          <th>${lang === "bn" ? "স্টক" : "Stock"}</th>
          <th>${lang === "bn" ? "মূল্য" : "Price"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="summary">
      <strong>${lang === "bn" ? "মোট পণ্য" : "Total Products"}: ${
      products.length
    }</strong>
    </div>
  `
  );
}

// Sales Report
async function generateSalesReport(
  lang,
  shopName,
  currentDate,
  startDate,
  endDate
) {
  const sales = await Sale.findByDateRange(startDate, endDate);
  const salesWithProducts = await Sale.findWithProducts({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const title = lang === "bn" ? "বিক্রয় রিপোর্ট" : "Sales Report";
  const period = `${formatDate(startDate, lang)} - ${formatDate(
    endDate,
    lang
  )}`;

  let rows = "";
  let totalAmount = 0;
  let totalQuantity = 0;

  salesWithProducts.forEach((sale, index) => {
    totalAmount += sale.totalAmount;
    totalQuantity += sale.quantitySold;

    // Show both names if both exist
    let productName = "-";
    if (sale.product) {
      if (sale.product.name_bn && sale.product.name_en) {
        productName = `${sale.product.name_bn}<br/><small style="color: #666">${sale.product.name_en}</small>`;
      } else {
        productName = sale.product.name_bn || sale.product.name_en;
      }
    }

    rows += `
      <tr>
        <td>${index + 1}</td>
        <td>${formatDate(sale.createdAt, lang)}</td>
        <td>${productName}</td>
        <td style="text-align: right">${sale.quantitySold}</td>
        <td style="text-align: right">${formatCurrency(
          sale.sellingPrice,
          lang
        )}</td>
        <td style="text-align: right"><strong>${formatCurrency(
          sale.totalAmount,
          lang
        )}</strong></td>
      </tr>
    `;
  });

  return generatePDFTemplate(
    lang,
    shopName,
    title,
    currentDate,
    `
    <div class="period"><strong>${
      lang === "bn" ? "সময়কাল" : "Period"
    }: ${period}</strong></div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${lang === "bn" ? "তারিখ" : "Date"}</th>
          <th>${lang === "bn" ? "পণ্য" : "Product"}</th>
          <th>${lang === "bn" ? "পরিমাণ" : "Quantity"}</th>
          <th>${lang === "bn" ? "মূল্য" : "Price"}</th>
          <th>${lang === "bn" ? "মোট" : "Total"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="summary">
      <p><strong>${lang === "bn" ? "মোট বিক্রয়" : "Total Sales"}: ${
      salesWithProducts.length
    }</strong></p>
      <p><strong>${
        lang === "bn" ? "মোট পরিমাণ" : "Total Quantity"
      }: ${totalQuantity}</strong></p>
      <p><strong>${
        lang === "bn" ? "মোট আয়" : "Total Revenue"
      }: ${formatCurrency(totalAmount, lang)}</strong></p>
    </div>
  `
  );
}

// Stock Movement Report
async function generateStockMovementReport(
  lang,
  shopName,
  currentDate,
  startDate,
  endDate
) {
  const movements = await StockMovement.findWithProducts({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  const title =
    lang === "bn" ? "স্টক মুভমেন্ট রিপোর্ট" : "Stock Movement Report";
  const period = `${formatDate(startDate, lang)} - ${formatDate(
    endDate,
    lang
  )}`;

  let rows = "";
  movements.forEach((movement, index) => {
    const typeLabel =
      movement.type === "IN"
        ? "ইন"
        : movement.type === "OUT"
        ? "আউট"
        : "সম্পাদনা";

    // Show both names if both exist
    let productName = "-";
    if (movement.product) {
      if (movement.product.name_bn && movement.product.name_en) {
        productName = `${movement.product.name_bn}<br/><small style="color: #666">${movement.product.name_en}</small>`;
      } else {
        productName = movement.product.name_bn || movement.product.name_en;
      }
    }

    rows += `
      <tr>
        <td>${index + 1}</td>
        <td>${formatDate(movement.createdAt, lang)}</td>
        <td><span class="badge-${movement.type.toLowerCase()}">${typeLabel}</span></td>
        <td>${productName}</td>
        <td style="text-align: right">${movement.quantity}</td>
        <td style="text-align: right">${movement.quantityBefore}</td>
        <td style="text-align: right">${movement.quantityAfter}</td>
        <td>${movement.note || "-"}</td>
      </tr>
    `;
  });

  return generatePDFTemplate(
    lang,
    shopName,
    title,
    currentDate,
    `
    <div class="period"><strong>${
      lang === "bn" ? "সময়কাল" : "Period"
    }: ${period}</strong></div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${lang === "bn" ? "তারিখ" : "Date"}</th>
          <th>${lang === "bn" ? "ধরন" : "Type"}</th>
          <th>${lang === "bn" ? "পণ্য" : "Product"}</th>
          <th>${lang === "bn" ? "পরিমাণ" : "Quantity"}</th>
          <th>${lang === "bn" ? "আগে" : "Before"}</th>
          <th>${lang === "bn" ? "পরে" : "After"}</th>
          <th>${lang === "bn" ? "নোট" : "Note"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="summary">
      <strong>${lang === "bn" ? "মোট মুভমেন্ট" : "Total Movements"}: ${
      movements.length
    }</strong>
    </div>
  `
  );
}

// Low Stock Report
async function generateLowStockReport(lang, shopName, currentDate) {
  const lowStockProducts = await Product.getLowStock();
  const outOfStockProducts = await Product.getOutOfStock();

  const title = lang === "bn" ? "কম স্টক রিপোর্ট" : "Low Stock Report";

  let rows = "";

  // Out of stock first
  outOfStockProducts.forEach((product, index) => {
    // Show both names if both exist
    let productName = "";
    if (product.name_bn && product.name_en) {
      productName = `${product.name_bn}<br/><small style="color: #666">${product.name_en}</small>`;
    } else {
      productName = product.name_bn || product.name_en;
    }

    rows += `
      <tr class="out-of-stock">
        <td>${index + 1}</td>
        <td>${productName}</td>
        <td>${product.category_bn || product.category_en}</td>
        <td>${product.partCode}</td>
        <td style="text-align: right; color: red"><strong>0</strong></td>
        <td style="text-align: right">${product.minimumStockLevel}</td>
        <td><span class="badge-out">স্টক শেষ</span></td>
      </tr>
    `;
  });

  // Then low stock
  lowStockProducts
    .filter((p) => p.stockQuantity > 0)
    .forEach((product, index) => {
      // Show both names if both exist
      let productName = "";
      if (product.name_bn && product.name_en) {
        productName = `${product.name_bn}<br/><small style="color: #666">${product.name_en}</small>`;
      } else {
        productName = product.name_bn || product.name_en;
      }

      rows += `
      <tr class="low-stock">
        <td>${outOfStockProducts.length + index + 1}</td>
        <td>${productName}</td>
        <td>${product.category_bn || product.category_en}</td>
        <td>${product.partCode}</td>
        <td style="text-align: right; color: orange"><strong>${
          product.stockQuantity
        }</strong></td>
        <td style="text-align: right">${product.minimumStockLevel}</td>
        <td><span class="badge-low">কম স্টক</span></td>
      </tr>
    `;
    });

  return generatePDFTemplate(
    lang,
    shopName,
    title,
    currentDate,
    `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>${lang === "bn" ? "পণ্যের নাম" : "Product Name"}</th>
          <th>${lang === "bn" ? "ক্যাটাগরি" : "Category"}</th>
          <th>${lang === "bn" ? "পার্ট কোড" : "Part Code"}</th>
          <th>${lang === "bn" ? "বর্তমান স্টক" : "Current Stock"}</th>
          <th>${lang === "bn" ? "ন্যূনতম স্টক" : "Minimum Stock"}</th>
          <th>${lang === "bn" ? "অবস্থা" : "Status"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="summary">
      <p><strong>${lang === "bn" ? "স্টক শেষ" : "Out of Stock"}: ${
      outOfStockProducts.length
    }</strong></p>
      <p><strong>${lang === "bn" ? "কম স্টক" : "Low Stock"}: ${
      lowStockProducts.filter((p) => p.stockQuantity > 0).length
    }</strong></p>
    </div>
  `
  );
}

// PDF Template
function generatePDFTemplate(lang, shopName, title, date, content) {
  const fontFamily =
    lang === "bn" ? "'Hind Siliguri', sans-serif" : "'Arial', sans-serif";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: ${fontFamily};
          font-size: 12px;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .header h2 {
          margin: 5px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 11px;
        }
        
        .period {
          text-align: center;
          margin: 15px 0;
          font-size: 13px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: 600;
        }
        
        .summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
        }
        
        .summary p {
          margin: 5px 0;
        }
        
        .badge-in {
          background-color: #d4edda;
          color: #155724;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }
        
        .badge-out {
          background-color: #f8d7da;
          color: #721c24;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }
        
        .badge-low {
          background-color: #fff3cd;
          color: #856404;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 10px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${shopName}</h1>
        <h2>${title}</h2>
        <p>${lang === "bn" ? "তারিখ" : "Date"}: ${date}</p>
      </div>
      
      ${content}
      
      <div class="footer">
        <p>${
          lang === "bn"
            ? "এই রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি হয়েছে"
            : "This report was generated automatically"
        }</p>
      </div>
    </body>
    </html>
  `;
}
