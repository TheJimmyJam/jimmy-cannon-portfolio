// Netlify serverless function — relays contact form submissions via Resend
// Deploy this file to netlify/functions/contact.js
//
// Set one environment variable in Netlify:
//   RESEND_API_KEY = your Resend API key (from resend.com → API Keys)

const RESEND_API_URL = 'https://api.resend.com/emails';

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields are required' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['wcannon83@gmail.com'],
        reply_to: email,
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7;">
            <h2 style="margin: 0 0 20px; font-size: 20px; color: #09090b;">New message from your portfolio</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #52525b;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #09090b; width: 80px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #09090b;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #09090b;">Subject</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">${subject}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 8px; border: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 14px; color: #09090b; line-height: 1.75; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin: 20px 0 0; font-size: 12px; color: #a1a1aa;">Sent from jimmycannon.dev portfolio contact form</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Resend error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
  }
};
