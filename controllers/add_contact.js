const Contact = require("../Models/contact.Model");
const { validationResult } = require("express-validator");
const axios = require("axios");

const sendEmailNotification = async (contactData) => {
  const API_KEY = process.env.BREVO_API_KEY;
  const RECIPIENT_EMAIL = "sm.medical.tn@gmail.com";

  const emailData = {
    sender: {
      name: "SM Medical",
      email: "contact@codini.tn",
    },
    to: [
      {
        email: RECIPIENT_EMAIL,
        name: "SM Medical",
      },
    ],
    subject: `Nouveau message de contact - SM Medical`,
    htmlContent: `
      <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #162832; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">SM Medical</h1>
                    <p style="color: #e99c79; margin: 10px 0 0 0; font-size: 14px;">Nouveau message de contact</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="color: #162832; font-size: 16px; margin: 0 0 20px 0;">Vous avez reçu un nouveau message de contact sur votre site web.</p>
                    
                    <h3 style="color: #e99c79; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e99c79; padding-bottom: 10px;">Détails du contact</h3>
                    <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 25px;">
                      <tr style="background-color: #f9f9f9;">
                        <td style="color: #162832; font-weight: bold; width: 120px;">Nom:</td>
                        <td style="color: #162832;">${contactData.name}</td>
                      </tr>
                      <tr>
                        <td style="color: #162832; font-weight: bold;">Téléphone:</td>
                        <td style="color: #162832;">${contactData.phone}</td>
                      </tr>
                      <tr style="background-color: #f9f9f9;">
                        <td style="color: #162832; font-weight: bold;">Intervention:</td>
                        <td style="color: #162832;">${contactData.intervention || "Non spécifiée"}</td>
                      </tr>
                    </table>
                    
                    <h3 style="color: #e99c79; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e99c79; padding-bottom: 10px;">Message</h3>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #e99c79;">
                      <p style="color: #162832; margin: 0; line-height: 1.6;">${contactData.message || "Aucun message"}</p>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #162832; padding: 20px; text-align: center;">
                    <p style="color: #ffffff; margin: 0; font-size: 12px;">Ce message a été envoyé automatiquement depuis votre site web.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    textContent: `Nouveau message de contact - SM Medical

Détails du contact:
Nom: ${contactData.name}
Téléphone: ${contactData.phone}
Intervention: ${contactData.intervention || "Non spécifiée"}

Message:
${contactData.message || "Aucun message"}

Ce message a été envoyé automatiquement depuis votre site web.`,
  };

  console.log("Attempting to send email notification:", {
    to: emailData.to,
    sender: emailData.sender,
    subject: emailData.subject,
  });

  const response = await axios({
    method: "post",
    url: "https://api.brevo.com/v3/smtp/email",
    headers: {
      accept: "application/json",
      "api-key": API_KEY,
      "content-type": "application/json",
    },
    data: emailData,
    validateStatus: () => true,
  });

  if (response.status >= 200 && response.status < 300) {
    console.log("Email notification sent successfully");
    return response.data;
  } else {
    console.error(`API returned status code ${response.status}`);
    throw new Error(`Brevo API error: ${JSON.stringify(response.data)}`);
  }
};

const addcontact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs requis doivent être remplis",
      errors: errors.array(),
    });
  }

  try {
    const { name, phone, intervention, message } = req.body;

    const contact = new Contact({
      name,
      phone,
      intervention,
      message,
      status: "new",
    });

    await contact.save();

    // Send email notification
    try {
      await sendEmailNotification({ name, phone, intervention, message });
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: "Contact créé avec succès",
      data: contact,
    });
  } catch (error) {
    console.error("Error saving contact form data:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

module.exports = { addcontact };
