import nodemailer from "nodemailer";
import * as XLSX from "xlsx";

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
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[Email] SMTP not configured. Email not sent.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions: any = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
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
