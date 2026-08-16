import PDFDocument from "pdfkit";

export async function buildResumePdf(resume: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margins: { top: 42, bottom: 42, left: 48, right: 48 } });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const addSection = (title: string) => {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(10).text(title.toUpperCase(), { characterSpacing: 0.5 });
      doc.moveTo(doc.x, doc.y + 3).lineTo(564, doc.y + 3).strokeColor("#999").stroke();
      doc.moveDown(0.35).fillColor("#111").font("Helvetica").fontSize(9.5);
    };

    doc.fillColor("#111").font("Helvetica-Bold").fontSize(20).text(resume.name || "Candidate");
    if (resume.contact) doc.font("Helvetica").fontSize(9).fillColor("#333").text(resume.contact);
    doc.fillColor("#111");

    if (resume.summary) { addSection("Professional Summary"); doc.text(resume.summary, { lineGap: 2 }); }
    if (resume.skills?.length) { addSection("Core Skills"); doc.text(resume.skills.join(" • "), { lineGap: 2 }); }

    if (resume.experience?.length) {
      addSection("Professional Experience");
      for (const e of resume.experience) {
        doc.font("Helvetica-Bold").fontSize(10).text(`${e.title || ""}${e.company ? ` — ${e.company}` : ""}`);
        doc.font("Helvetica-Oblique").fontSize(8.8).fillColor("#444").text([e.location, e.dates].filter(Boolean).join(" | "));
        doc.fillColor("#111").font("Helvetica").fontSize(9.5);
        for (const b of e.bullets || []) doc.text(`• ${b}`, { indent: 10, lineGap: 1.5 });
        doc.moveDown(0.3);
      }
    }

    if (resume.education?.length) {
      addSection("Education");
      for (const e of resume.education) {
        doc.font("Helvetica-Bold").text(`${e.degree || ""}${e.school ? ` — ${e.school}` : ""}`);
        if (e.dates) doc.font("Helvetica-Oblique").fontSize(8.8).fillColor("#444").text(e.dates);
        doc.fillColor("#111").font("Helvetica").fontSize(9.5);
        for (const d of e.details || []) doc.text(`• ${d}`, { indent: 10 });
      }
    }
    if (resume.certifications?.length) { addSection("Certifications"); resume.certifications.forEach((x: string) => doc.text(`• ${x}`)); }
    if (resume.additional?.length) { addSection("Additional Information"); resume.additional.forEach((x: string) => doc.text(`• ${x}`)); }

    doc.end();
  });
}
