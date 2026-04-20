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
  console.log('API key present:', !!apiKey, '| length:', apiKey?.length ?? 0);
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
        from: 'Portfolio Contact <noreply@lonestarbarkco.com>',
        to: ['williamjamescannon@gmail.com'],
        reply_to: email,
        subject: `🚨 YOU'VE GOT A NEW CONTACT! — ${name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

            <!-- HERO BANNER -->
            <div style="background: linear-gradient(135deg, #0f0f12 0%, #131525 50%, #0f1629 100%); padding: 48px 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -1px;">YOU'VE GOT A NEW CONTACT!</h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.5);">Someone reached out through your portfolio</p>
            </div>

            <!-- QUICK STATS BAR -->
            <div style="background: #2563eb; padding: 16px 40px; display: flex; justify-content: center;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                ⚡ &nbsp;Reply fast — first impressions matter
              </p>
            </div>

            <!-- CONTACT DETAILS -->
            <div style="padding: 40px; background: #f8fafc; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">

              <div style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                <div style="background: #f1f5f9; padding: 14px 24px; border-bottom: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Contact Details</p>
                </div>

                <div style="padding: 0 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; width: 80px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">From</td>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 16px; font-weight: 700; color: #0f172a;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Email</td>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #2563eb; font-weight: 600; font-size: 15px; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Subject</td>
                      <td style="padding: 16px 0; font-size: 15px; color: #0f172a;">${subject}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- MESSAGE -->
              <div style="margin-top: 20px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                <div style="background: #f1f5f9; padding: 14px 24px; border-bottom: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Their Message</p>
                </div>
                <div style="padding: 24px;">
                  <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.8; white-space: pre-wrap;">${message}</p>
                </div>
              </div>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; letter-spacing: -0.2px;">
                  Reply to ${name} →
                </a>
              </div>
            </div>

            <!-- FOOTER -->
            <div style="background: #0f172a; padding: 24px 40px; text-align: center; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.35);">Sent from your portfolio contact form · William "Jimmy" Cannon</p>
            </div>

          </div>
        `,
      }),
    });

    const resBody = await res.json();
    console.log('Resend status:', res.status);
    console.log('Resend response:', JSON.stringify(resBody));
    if (!res.ok) {
      console.error('Resend error:', resBody);
      return { statusCode: 500, body: JSON.stringify({ error: resBody?.message || 'Failed to send email' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) };
  }
};
