export async function sendEmailNotification(contactData, env) {
  const API_KEY = env.BREVO_API_KEY;
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
                      <tr>
                        <td style="color: #162832; font-weight: bold;">Email:</td>
                        <td style="color: #162832;">${contactData.email}</td>
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

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}
