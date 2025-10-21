require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const paymentController = require("./router/payment");
const notificationController = require("./router/notification");

let fetch;
try {
  // For Node.js >= 18 (with built-in fetch)
  if (!globalThis.fetch) {
    fetch = require("node-fetch");
  } else {
    fetch = globalThis.fetch;
  }
} catch (error) {
  console.error("Error importing fetch:", error);
  // Fallback to node-fetch
  fetch = require("node-fetch");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://drjoints.in',
    'https://drjoints.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Add credentials support for cookies/auth headers if needed
}));
app.use(bodyParser.json());


app.use('/api', notificationController);
app.use('/api', paymentController);

// // Nodemailer Configuration
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Email Sending Route
// app.post("/send-email", async (req, res) => {
//   const { to, subject, message, name, email, phone, domain, productName } = req.body;

//   // For contact form submissions, send to customer care email
//   const recipientEmail = to || "customercareproductcenter@gmail.com";
  
//   // Determine the source domain/product
//   const sourceIdentifier = domain || productName || 'Unknown Source';
  
//   // Format the email content for contact form
//   let emailContent = message;
//   if (name || email || phone) {
//     emailContent = `
//       Contact Form Submission from: ${sourceIdentifier}

//       Name: ${name || 'Not provided'}
//       Email: ${email || 'Not provided'}
//       Phone: ${phone || 'Not provided'}
//       Source Domain/Product: ${sourceIdentifier}

//       Message:
//       ${message}
//     `;
//   }

//   // Add domain/product info to subject if not already present
//   const emailSubject = subject && subject.includes(sourceIdentifier) 
//     ? subject 
//     : `${subject || 'Contact Form Submission'} - ${sourceIdentifier}`;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: recipientEmail,
//     subject: emailSubject,
//     text: emailContent,
//     // Add reply-to if customer email is provided
//     ...(email && { replyTo: email })
//   }; 
 
//   try {
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ success: true, message: "Email sent successfully!" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ success: false, message: "Email sending failed!", error: error.message });
//   }
// });

// // Order Confirmation Email Route
// app.post("/send-order-confirmation", async (req, res) => {
//   const { customerEmail, orderDetails, customerDetails } = req.body;
  
//   // Log the incoming request data
//   console.log("Received order confirmation request:", { 
//     customerEmail, 
//     orderDetails: JSON.stringify(orderDetails),
//     customerDetails: JSON.stringify(customerDetails) 
//   });
  
//   if (!customerEmail) {
//     return res.status(400).json({
//       success: false,
//       message: "Customer email is required"
//     });
//   }
  
//   // Format the email content
//   const emailSubject = `Order Confirmation #${orderDetails.orderNumber}`;
  
//   // Check if orderDetails.products is an array for multiple products
//   const hasMultipleProducts = Array.isArray(orderDetails.products) && orderDetails.products.length > 0;
  
//   // Generate product table content
//   let productsContent = '';
  
//   if (hasMultipleProducts) {
//     // Create a table for multiple products
//     productsContent = `Products:
//     +${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+
//     | Product Name                            | Quantity | Price        |
//     +${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+
//     `;

//     // Add each product as a row in the table
//     orderDetails.products.forEach(product => {
//       const name = (product.name || '').padEnd(40).substring(0, 40);
//       const quantity = (product.quantity?.toString() || '').padEnd(10).substring(0, 10);
//       const price = ((orderDetails.currency || '₹') + ' ' + (product.price || '')).padEnd(15).substring(0, 15);
      
//       productsContent += `| ${name} | ${quantity} | ${price} | `;
//     });
//     productsContent += `+${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+`;
//   } else {
//     // Single product format
//     productsContent = `Product: ${orderDetails.productName || 'N/A'}
//     Quantity: ${orderDetails.quantity || '1'}`;
//   }
  
//   // Add HTML version of the email
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2>Order Confirmation</h2>
//       <p>Dear ${customerDetails.firstName} ${customerDetails.lastName},</p>
      
//       <p>Thank you for your order! We're pleased to confirm that your order has been successfully placed.</p>
      
//       <h3>Order Details:</h3>
//       <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
      
//       ${hasMultipleProducts ? 
//         `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//           <tr style="background-color: #f2f2f2;">
//             <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Product Name</th>
//             <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">Quantity</th>
//             <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Price</th>
//           </tr>
//           ${orderDetails.products.map(product => 
//             `<tr>
//               <td style="padding: 8px; border: 1px solid #ddd;">${product.name || ''}</td>
//               <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${product.quantity || ''}</td>
//               <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${orderDetails.currency || '₹'} ${product.price || ''}</td>
//             </tr>`
//           ).join('')}
//         </table>` 
//         : 
//         `<p><strong>Product:</strong> ${orderDetails.productName || 'N/A'}<br>
//         <strong>Quantity:</strong> ${orderDetails.quantity || '1'}</p>`
//       }
      
//       <p><strong>Total Amount:</strong> ${orderDetails.currency || '₹'} ${orderDetails.totalAmount}<br>
//       <strong>Payment Method:</strong> ${orderDetails.paymentMethod}<br>
//       <strong>Payment ID:</strong> ${orderDetails.paymentId || 'N/A'}</p>
      
//       <h3>Customer Details:</h3>
//       <p>
//         <strong>Name:</strong> ${customerDetails.firstName} ${customerDetails.lastName}<br>
//         <strong>Email:</strong> ${customerEmail}<br>
//         <strong>Phone:</strong> ${customerDetails.phone || 'Not provided'}
//       </p>
      
//       <h3>Shipping Address:</h3>
//       <p>
//         ${customerDetails.address || ''}<br>
//         ${customerDetails.apartment ? customerDetails.apartment + '<br>' : ''}
//         ${customerDetails.city || ''}${customerDetails.city && customerDetails.state ? ', ' : ''}${customerDetails.state || ''}${(customerDetails.city || customerDetails.state) && customerDetails.zip ? ' - ' : ''}${customerDetails.zip || ''}<br>
//         ${customerDetails.country || ''}
//       </p>
      
//       <p>We will process your order shortly. You will receive another email once your order ships.</p>
      
//       <p>If you have any questions, please contact our customer service.</p>
      
//       <p>Thank you for shopping with us!</p>
//       <p>Best regards,<br></p>
//     </div>
//   `;
  
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: customerEmail,
//     cc: process.env.EMAIL_USER, // CC to admin email
//     subject: emailSubject,
//     html: htmlContent // Add HTML version for better formatting
//   };

//   try {
//     console.log("Attempting to send email to:", customerEmail);
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", info.messageId);
//     res.status(200).json({ success: true, message: "Confirmation email sent successfully!" });
//   } catch (error) {
//     console.error("Error sending confirmation email:", error);
//     res.status(500).json({ success: false, message: "Failed to send confirmation email", error: error.message });
//   }
// });

//   // Abandoned Order Follow-up Email Route
// app.post("/send-abandoned-order-email", async (req, res) => {
//   const { customerEmail, orderDetails, customerDetails } = req.body;
  
//   console.log("Received abandoned order follow-up request:", { 
//     customerEmail, 
//     orderDetails: JSON.stringify(orderDetails),
//     customerDetails: JSON.stringify(customerDetails) 
//   });
  
//   if (!customerEmail) {
//     return res.status(400).json({
//       success: false,
//       message: "Customer email is required"
//     });
//   }
  
//   // Format the email content
//   const emailSubject = `We noticed you didn't complete your order #${orderDetails.orderNumber}`;
  
//   // Check if orderDetails.products is an array for multiple products
//   const hasMultipleProducts = Array.isArray(orderDetails.products) && orderDetails.products.length > 0;
  
//   // Generate product table content
//   let productsContent = '';
  
//   if (hasMultipleProducts) {
//     // Create a table for multiple products
//     productsContent = `Products:
//     +${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+
//     | Product Name                            | Quantity | Price        |
//     +${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+
//     `;

//     // Add each product as a row in the table
//     orderDetails.products.forEach(product => {
//       const name = (product.name || '').padEnd(40).substring(0, 40);
//       const quantity = (product.quantity?.toString() || '').padEnd(10).substring(0, 10);
//       const price = ((orderDetails.currency || '₹') + ' ' + (product.price || '')).padEnd(15).substring(0, 15);
      
//       productsContent += `| ${name} | ${quantity} | ${price} |
//     `;
//     });
    
//     productsContent += `+${'-'.repeat(40)}+${'-'.repeat(10)}+${'-'.repeat(15)}+`;
//   } else {
//     // Single product format
//     productsContent = `Product: ${orderDetails.productName || 'N/A'}
//     Quantity: ${orderDetails.quantity || '1'}`;
//   }
  
//   // Enhanced email template with better formatting for customer details
//   const emailContent = `
//     Dear ${customerDetails.firstName} ${customerDetails.lastName},
    
//     We noticed that you recently started an order on our website but didn't complete the checkout process.
    
//     Customer Details:
//     - Name: ${customerDetails.firstName} ${customerDetails.lastName}
//     - Email: ${customerDetails.email}
//     - Phone: ${customerDetails.phone || 'Not provided'}
    
//     Address Information:
//     ${customerDetails.address || 'Address not provided'}
//     ${customerDetails.apartment ? customerDetails.apartment + '\n' : ''}
//     ${customerDetails.city || ''}${customerDetails.city && customerDetails.state ? ', ' : ''}${customerDetails.state || ''}${(customerDetails.city || customerDetails.state) && customerDetails.zip ? ' - ' : ''}${customerDetails.zip || ''}
//     ${customerDetails.country || ''}
    
//     Order Details:
//     - Order ID: ${orderDetails.orderNumber}
//     ${productsContent}
//     - Total Amount: ${orderDetails.currency || '₹'} ${orderDetails.totalAmount}
    
//     We'd love to know if you experienced any issues during checkout or if you have any questions about our product.
//     You can simply reply to this email, and we'll be happy to assist you.
    
//     If you'd like to complete your purchase, you can return to our website and try again.
    
//     Thank you for considering our products!
//     Best regards,
    
//   `;
  
//   // Add HTML version of the email
//   const htmlContent = `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2>Your Shopping Cart is Waiting</h2>
//       <p>Dear ${customerDetails.firstName} ${customerDetails.lastName},</p>
      
//       <p>We noticed that you recently started an order on our website but didn't complete the checkout process.</p>
      
//       <h3>Order Details:</h3>
//       <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
      
//       ${hasMultipleProducts ? 
//         `<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//           <tr style="background-color: #f2f2f2;">
//             <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Product Name</th>
//             <th style="text-align: center; padding: 8px; border: 1px solid #ddd;">Quantity</th>
//             <th style="text-align: right; padding: 8px; border: 1px solid #ddd;">Price</th>
//           </tr>
//           ${orderDetails.products.map(product => 
//             `<tr>
//               <td style="padding: 8px; border: 1px solid #ddd;">${product.name || ''}</td>
//               <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${product.quantity || ''}</td>
//               <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${orderDetails.currency || '₹'} ${product.price || ''}</td>
//             </tr>`
//           ).join('')}
//         </table>` 
//         : 
//         `<p><strong>Product:</strong> ${orderDetails.productName || 'N/A'}<br>
//         <strong>Quantity:</strong> ${orderDetails.quantity || '1'}</p>`
//       }
      
//       <p><strong>Total Amount:</strong> ${orderDetails.currency || '₹'} ${orderDetails.totalAmount}<br>
//       <strong>Payment Method:</strong> ${orderDetails.paymentMethod}<br>
//       <strong>Payment ID:</strong> ${orderDetails.paymentId || 'N/A'}</p>
      
//       <h3>Customer Details:</h3>
//       <p>
//         <strong>Name:</strong> ${customerDetails.firstName} ${customerDetails.lastName}<br>
//         <strong>Email:</strong> ${customerEmail}<br>
//         <strong>Phone:</strong> ${customerDetails.phone || 'Not provided'}
//       </p>
      
//       <h3>Shipping Address:</h3>
//       <p>
//         ${customerDetails.address || ''}<br>
//         ${customerDetails.apartment ? customerDetails.apartment + '<br>' : ''}
//         ${customerDetails.city || ''}${customerDetails.city && customerDetails.state ? ', ' : ''}${customerDetails.state || ''}${(customerDetails.city || customerDetails.state) && customerDetails.zip ? ' - ' : ''}${customerDetails.zip || ''}<br>
//         ${customerDetails.country || ''}
//       </p>
      
//       <p>We'd love to know if you experienced any issues during checkout or if you have any questions about our product.</p>
//       <p>You can simply reply to this email, and we'll be happy to assist you.</p>
      
//       <p>If you'd like to complete your purchase, you can return to our website and try again.</p>
      
//       <p>Thank you for considering our products!</p>
      
//       <p>Best regards,<br></p>
//     </div>
//   `;
  
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: customerEmail,
//     cc: process.env.EMAIL_USER, // CC to admin email
//     subject: emailSubject,
//     html: htmlContent // Add HTML version for better formatting
//   };

//   try {
//     console.log("Attempting to send abandoned order follow-up email to:", customerEmail);
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Abandoned order follow-up email sent successfully:", info.messageId);
//     res.status(200).json({ success: true, message: "Abandoned order follow-up email sent successfully!" });
//   } catch (error) {
//     console.error("Error sending abandoned order follow-up email:", error);
//     res.status(500).json({ success: false, message: "Failed to send abandoned order follow-up email", error: error.message });
//   }
// });

// // Create Razorpay Order
// app.post("/create-order", async (req, res) => {
//   try {
//     const { amount, currency, receipt, notes } = req.body;
    
//     const options = {
//       amount: amount * 100, // Convert to paise (Razorpay requires amount in smallest currency unit)
//       currency: currency || "INR",
//       receipt: receipt || `receipt_${Date.now()}`,
//       notes: notes || {},
//     };
    
//     const order = await razorpay.orders.create(options);
    
//     res.status(200).json({
//       success: true,
//       order,
//       key: process.env.RAZORPAY_KEY_ID, // Send key_id to frontend for initialization
//     });
//   } catch (error) {
//     console.error("Order creation failed:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create order",
//       error: error.message,
//     });
//   }
// });

// // Verify Razorpay Payment
// app.post("/verify-payment", async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     // Verify signature
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign)
//       .digest("hex");
      
//     const isAuthentic = expectedSignature === razorpay_signature;
    
//     if (isAuthentic) {
//       // Payment verification successful
//       res.status(200).json({ 
//         success: true,
//         message: "Payment verification successful",
//         orderId: razorpay_order_id,
//         paymentId: razorpay_payment_id
//       });
//     } else {
//       // Payment verification failed
//       res.status(400).json({
//         success: false,
//         message: "Payment verification failed",
//       });
//     }
//   } catch (error) {
//     console.error("Payment verification error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during verification",
//       error: error.message,
//     });
//   }
// });


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});