// Google Apps Script Code (Code.gs)
// 1. Create a Google Sheet.
// 2. Go to Extensions > Apps Script.
// 3. Paste this code into Code.gs.
// 4. Update the SHEET_NAME if necessary.
// 5. Deploy as Web App (New Deployment > Web App > Execute as Me > Who has access: Anyone).
// 6. Copy the Web App URL and paste it into your React app's registration form submission logic.

const SHEET_NAME = "Sheet1";
const HEADERS = ["Timestamp", "Email", "Name", "Phone", "College", "Department", "Year", "Payment Status", "Participant ID"];


function getSheet() {
  const ss = SpreadsheetApp.getActive();
  if (!ss) {
    throw new Error("Spreadsheet not found. If this is a standalone script, please open the script from the Google Sheet (Extensions > Apps Script).");
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '');
        obj[key] = row[index];
      });
      return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const sheet = getSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Check for duplicate email
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      if (emails.includes(data.email)) {
        return ContentService.createTextOutput(JSON.stringify({
          result: "error",
          message: "Email already registered"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Generate Participant ID
    const count = lastRow === 0 ? 1 : lastRow; 
    const participantId = "AXION2026-" + String(count).padStart(3, '0');

    const row = [
      new Date(),
      data.email,
      data.name,
      data.phone,
      data.college,
      data.department,
      data.year,
      data.paymentStatus,
      participantId
    ];
    sheet.appendRow(row);

    sendConfirmationEmail(data, participantId);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      participantId: participantId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function sendConfirmationEmail(data, participantId) {
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + participantId;
  
  const subject = "Your AXION 2K26 Digital ID Card";
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; background-color: #f8fafc; padding: 40px;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 28px; letter-spacing: -1px;">AXION 2K26</h2>
          <p style="margin: 5px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">Hardware & Intelligence Workshop</p>
        </div>
        
        <!-- Body -->
        <div style="background: white; margin: 0 20px 20px; border-radius: 16px; padding: 30px; text-align: center;">
          <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-center;">
             <img src="https://img.icons8.com/ios-filled/50/2563eb/user-male-circle.png" style="width: 40px; margin-top: 20px;"/>
          </div>
          
          <h3 style="margin: 0; color: #0f172a; font-size: 20px; text-transform: uppercase;">${data.name}</h3>
          <p style="margin: 5px 0 20px; color: #2563eb; font-weight: 600; font-size: 14px;">${data.department} • ${data.year} Year</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: left; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">College</span>
              <span style="font-size: 11px; color: #1e293b; font-weight: bold; float: right;">${data.college}</span>
            </div>
            <div style="clear: both;"></div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">ID Number</span>
              <span style="font-size: 11px; color: #2563eb; font-weight: bold; float: right;">${participantId}</span>
            </div>
            <div style="clear: both;"></div>
          </div>

          <div style="margin-bottom: 10px;">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 120px; height: 120px; border: 1px solid #e2e8f0; padding: 5px; border-radius: 8px;" />
          </div>
          <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Scan for Entry Verification</p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 15px; text-align: center; background: #0f172a;">
          <p style="margin: 0; font-size: 9px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Vidyaa Vikas College of Engineering and Technology</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 13px; line-height: 1.6;">
        <p>This is your official digital ID card for <strong>AXION 2K26</strong>.<br>Please present this email or a screenshot at the registration desk.</p>
        <p style="color: #ef4444; font-weight: bold; margin-top: 10px;">Mandatory for entry, food, and certification.</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody
  });
}
