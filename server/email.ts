import nodemailer from "nodemailer";
import * as XLSX from "xlsx";
import * as db from "./db";
import { logEmail } from "./emailLogger";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachmentBuffer?: Buffer;
  attachmentFilename?: string;
}

/**
 * Send email with optional Excel attachment
 * Note: This requires SMTP configuration via environment variables
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Try to get SMTP config from database first
    const smtpConfig = await db.getSmtpConfig();
    logEmail('info', 'SMTP Config retrieved from DB', {
      exists: !!smtpConfig,
      host: smtpConfig?.host,
      user: smtpConfig?.user,
      hasPass: !!smtpConfig?.pass,
      port: smtpConfig?.port,
      secure: smtpConfig?.secure,
      from: smtpConfig?.from,
      destinationEmail: smtpConfig?.destinationEmail,
    });
    
    let host, port, secure, user, pass, from;
    
    if (smtpConfig && smtpConfig.host && smtpConfig.user && smtpConfig.pass) {
      logEmail('info', 'Using database SMTP config');
      // Use database config
      host = smtpConfig.host;
      port = smtpConfig.port || 587;
      secure = smtpConfig.secure === 1;
      user = smtpConfig.user;
      pass = smtpConfig.pass;
      from = smtpConfig.from || smtpConfig.user;
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Fallback to environment variables
      host = process.env.SMTP_HOST;
      port = parseInt(process.env.SMTP_PORT || "587");
      secure = process.env.SMTP_SECURE === "true";
      user = process.env.SMTP_USER;
      pass = process.env.SMTP_PASS;
      from = process.env.SMTP_FROM || process.env.SMTP_USER;
    } else {
      logEmail('error', 'SMTP not configured. Email not sent.');
      logEmail('error', 'Missing fields', {
        hasSmtpConfig: !!smtpConfig,
        hasHost: !!smtpConfig?.host,
        hasUser: !!smtpConfig?.user,
        hasPass: !!smtpConfig?.pass,
        hasEnvHost: !!process.env.SMTP_HOST,
        hasEnvUser: !!process.env.SMTP_USER,
        hasEnvPass: !!process.env.SMTP_PASS,
      });
      return false;
    }

    logEmail('info', 'Creating transporter with config', {
      host,
      port,
      secure,
      user,
      hasPass: !!pass,
      from,
    });

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions: any = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    if (options.attachmentBuffer && options.attachmentFilename) {
      mailOptions.attachments = [
        {
          filename: options.attachmentFilename,
          content: options.attachmentBuffer,
        },
      ];
    }

    logEmail('info', 'Sending email', {
      to: options.to,
      subject: options.subject,
      hasAttachment: !!options.attachmentBuffer,
    });

    const result = await transporter.sendMail(mailOptions);
    logEmail('info', 'Email sent successfully!', {
      to: options.to,
      messageId: result.messageId,
      response: result.response,
    });
    return true;
  } catch (error: any) {
    logEmail('error', 'Failed to send email!', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });
    return false;
  }
}

/**
 * Generate Excel buffer from slides data
 */
export function generateExcelBuffer(slides: any[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const data: any[][] = [];

  // Header row
  data.push([
    "Page",
    "Type de slide",
    "Thématique / Texte 1 / Expert",
    "Titre / Texte 2 / URL",
    "Texte 3",
    "Texte 4",
    "Auteur (si citation)",
    "Prompt Image 1",
    "Prompt Image 2",
    "Prompt Image 3",
    "Prompt Image 4",
  ]);

  const intermediateSlides = slides.filter((s: any) => s.type !== "Titre" && s.type !== "Finale");
  const fixedSlides = Array(10)
    .fill(null)
    .map((_, idx) => {
      const pageNumber = idx + 1;

      if (pageNumber === 1) {
        const titleSlide = slides.find((s: any) => s.type === "Titre");
        return [
          1,
          "Titre",
          titleSlide?.thematique || "",
          titleSlide?.titre || "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ];
      }

      if (pageNumber === 10) {
        const finalSlide = slides.find((s: any) => s.type === "Finale");
        return [
          10,
          "Finale",
          finalSlide?.expert || "",
          finalSlide?.expertise || "",
          "",
          "",
          finalSlide?.url || "",
          "",
          "",
          "",
          "",
        ];
      }

      const slideIndex = pageNumber - 2;
      const slide = intermediateSlides[slideIndex];

      if (!slide) {
        return [pageNumber, "", "", "", "", "", "", "", "", "", ""];
      }

      if (slide.type === "type1") {
        return [
          pageNumber,
          "type 1",
          slide.texte1 || "",
          "",
          "",
          "",
          "",
          slide.promptImage1 || "",
          "",
          "",
          "",
        ];
      } else if (slide.type === "type2") {
        return [
          pageNumber,
          "type 2",
          slide.texte1 || "",
          "",
          "",
          "",
          "",
          slide.promptImage1 || "",
          "",
          "",
          "",
        ];
      } else if (slide.type === "type3") {
        return [
          pageNumber,
          "type 3",
          slide.texte1 || "",
          "",
          "",
          "",
          "",
          slide.promptImage1 || "",
          "",
          "",
          "",
        ];
      } else if (slide.type === "type4") {
        return [
          pageNumber,
          "type 4",
          slide.texte1 || "",
          "",
          "",
          "",
          slide.auteur || "",
          "",
          "",
          "",
          "",
        ];
      } else if (slide.type === "type5") {
        return [
          pageNumber,
          "type 5",
          slide.texte1 || "",
          slide.texte2 || "",
          slide.texte3 || "",
          slide.texte4 || "",
          "",
          slide.promptImage1 || "",
          slide.promptImage2 || "",
          slide.promptImage3 || "",
          slide.promptImage4 || "",
        ];
      }

      return [pageNumber, "", "", "", "", "", "", "", "", "", ""];
    });

  fixedSlides.forEach((row) => data.push(row));

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Carrousel");

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}
