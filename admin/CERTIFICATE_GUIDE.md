# CodeQuarry Certificate of Completion — Staff Guide

> **Who this guide is for:** Teachers, batch coordinators, and admins who manage Bootcamp programs and want to issue completion certificates to participants.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Open the Certificate Manager](#3-step-1--open-the-certificate-manager)
4. [Step 2 — Design the Certificate Template](#4-step-2--design-the-certificate-template)
5. [Template Variable Reference](#5-template-variable-reference)
6. [Step 3 — Set the Attendance Threshold](#6-step-3--set-the-attendance-threshold)
7. [Step 4 — Issue Certificates](#7-step-4--issue-certificates)
8. [Step 5 — Sharing and Verification](#8-step-5--sharing-and-verification)
9. [Design Tips](#9-design-tips)
10. [Common Questions](#10-common-questions)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Overview

Each Bootcamp batch on CodeQuarry can have its own **certificate template**. When the instructor is satisfied with attendance records, they issue certificates to eligible students. Each certificate:

- Is generated as a **dark-themed A4 landscape PDF** with your custom text and accent colour.
- Carries a **unique UUID** printed at the bottom — this UUID can be publicly verified at `codequarry.app/verify/<uuid>`.
- Is permanently stored in the database and downloadable by the student at any time from their Batch Detail page.

---

## 2. Prerequisites

- You must have an **admin account** on CodeQuarry.
- The batch must already exist and have at least some attendance records. If no sessions have been marked, attendance percentages will all show 0 %.
- You need to know the **instructor's name** to appear on the certificate (this can be your own name or the lead teacher's name).

---

## 3. Step 1 — Open the Certificate Manager

1. Log in with your admin account and navigate to the **Bootcamp Manage** page (`/bootcamp/manage`).
2. Find the batch you want to manage certificates for.
3. Click the **Certificate** button (yellow, with a graduation-cap icon) on that batch's card.
4. The **Certificate Manager** modal opens.

It has two tabs:
- **Template** — design the certificate layout and text.
- **Issue** — see eligible students and issue certificates.

---

## 4. Step 2 — Design the Certificate Template

Switch to the **Template** tab if it is not already selected.

### Fields

| Field | Description | Example |
|---|---|---|
| **Certificate Title** | The headline displayed prominently on the certificate. | `Certificate of Completion` |
| **Subtitle** | A short descriptive line under the title. | `Issued by CodeQuarry Bootcamp Program` |
| **Body Text** | The main body paragraph. Supports template variables (see §5). | `This certifies that {{studentName}} has successfully completed the {{batchTitle}} program...` |
| **Instructor Name** | Full name/title that appears on the signature line. | `Budi Santoso, Lead Instructor` |
| **Footer Text** | Small text at the very bottom. Usually a disclaimer or motto. | `This is a non-accredited certificate of completion.` |
| **Accent Colour** | The brand colour used for the border, decorative bar, and highlight elements. Pick any hex colour. | `#a855f7` (purple) |

### Saving

Click **Save Template** when done. You can edit the template at any time — even after certificates have been issued. Re-issuing will regenerate PDFs with the new template text the next time a PDF is downloaded. (Previously issued certificates in the database are **not** retroactively updated; they will reflect the data at time of issue. The PDF is generated fresh on each download, so changing the template *will* affect future PDF renders of all certs.)

---

## 5. Template Variable Reference

Use these placeholders in the **Body Text** field. They are replaced with real values when the PDF is generated.

| Variable | Replaced with |
|---|---|
| `{{studentName}}` | The student's registered full name |
| `{{batchTitle}}` | The full title of the batch |
| `{{instructorName}}` | The instructor name from the template |
| `{{completionDate}}` | Formatted completion date (e.g. `15 July 2025`) |
| `{{certUuid}}` | The certificate's unique UUID |

### Example body text

```
This certifies that {{studentName}} has successfully completed the
{{batchTitle}} program, demonstrating commitment and proficiency in the
curriculum. Issued on {{completionDate}} under the supervision of {{instructorName}}.
```

---

## 6. Step 3 — Set the Attendance Threshold

The **Attendance Threshold (%)** field in the Template tab controls who appears as **ELIGIBLE** on the Issue tab.

- Default: **80 %**
- A student is eligible if their attendance percentage ≥ the threshold.
- Students below the threshold are still shown in the Issue tab but are labelled **BELOW THRESHOLD**.
- You can still manually issue to a below-threshold student by clicking their individual **Issue** button if you choose to make an exception.

Changing the threshold and saving the template will immediately update the eligible/ineligible badges on the Issue tab.

---

## 7. Step 4 — Issue Certificates

Switch to the **Issue** tab.

You will see a table of all enrolled students with:
- Their name
- Attendance percentage
- A badge: **ELIGIBLE** (green) or **BELOW THRESHOLD** (red)
- An **Issue** button and a **Download PDF** link

### Bulk Issue (recommended)

Click **Issue to All Eligible** at the top of the tab. This will issue certificates to every student who meets the attendance threshold in a single action. Already-issued certificates are not re-issued (the system does an upsert — safe to run multiple times).

### Individual Issue

Click the **Issue** button next to a specific student. Useful for exceptions or late additions.

### Downloading

Once a certificate has been issued, the **Download PDF** link becomes active. You can download any student's PDF directly from this panel.

The student can also download their own PDF from their **Batch Detail** page — it appears as a yellow certificate banner at the top of the page.

---

## 8. Step 5 — Sharing and Verification

### What the student receives

- A yellow **"You've earned a certificate!"** banner on their Batch Detail page.
- A **Download PDF** button that fetches a freshly-rendered PDF.
- The PDF shows a unique UUID at the bottom (e.g. `a3f1c2d4-...`).

### Public verification

Anyone — employers, universities, recruiters — can verify a certificate without logging in:

1. Go to: `https://codequarry.app/verify/<certUuid>`
2. The page shows the student's name, batch title, instructor, and date.
3. No personal contact details are revealed.

Encourage students to share the verification URL along with their CV. They can find their UUID on the downloaded PDF.

### Verification URL format

```
https://codequarry.app/verify/a3f1c2d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 9. Design Tips

### Choosing an accent colour

- **Purple `#a855f7`** — CodeQuarry brand default. Works well for general courses.
- **Gold `#f59e0b`** — Conveys prestige; great for advanced or flagship programs.
- **Teal `#14b8a6`** — Fresh, modern look for web/tech bootcamps.
- **Rose `#f43f5e`** — Energetic; suits short intensive programs.
- Avoid very light colours (e.g. `#ffffff`) — the certificate has a dark background, so light borders may not be visible.

### Writing good body text

Keep body text to 2–3 sentences maximum. The student name is the visual centrepiece; the body text provides context. Example:

> *This certifies that* **{{studentName}}** *has successfully completed the* **{{batchTitle}}** *program offered by CodeQuarry, demonstrating dedication and proficiency in the subject matter. Certificate issued on {{completionDate}}.*

### Instructor line

Use a full name + title for maximum credibility:
- `Budi Santoso, Lead Instructor, CodeQuarry`
- `Anisa Putri, Program Director`

---

## 10. Common Questions

**Q: Can I edit the template after certificates are issued?**  
A: Yes. The template text is stored separately. The PDF is rendered fresh on each download, so any template changes will appear in future PDF downloads. The core certificate data (student name, batch title, date) is locked at the time of issue.

**Q: Can I revoke a certificate?**  
A: Currently, revocation requires a database change. Contact the technical team with the certificate UUID and the reason for revocation.

**Q: What happens if a student changes their name?**  
A: The name is stored at the time of issue. If a correction is needed, the certificate must be re-issued after the database record is updated by an admin.

**Q: Can I issue certificates for a batch that has ended?**  
A: Yes. There is no time restriction. You can issue certificates at any point.

**Q: Is the PDF stored on the server?**  
A: No. PDFs are generated on-the-fly from stored data. There is no PDF file saved on the server.

**Q: Can a student download the PDF multiple times?**  
A: Yes, as many times as needed. The PDF is regenerated on each request.

**Q: Multiple instructors — whose name goes on the cert?**  
A: The **template's Instructor Name field** controls this. You can enter a comma-separated list (`Alice, Bob`) or a lead instructor's name. It's one text field, so format it however you'd like.

---

## 11. Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| No students appear in the Issue tab | Batch has no enrolled users or no attendance sessions | Verify sessions exist and students attended at least one |
| "Issue" button greyed out or fails | Template not saved yet | Save the template first (Template tab → Save Template) |
| PDF downloads but name is missing | Student's registered name is empty | Ask student to update their profile name; re-issue |
| Verification page shows "Certificate Not Found" | Certificate was not yet issued, or UUID was transcribed incorrectly | Double-check the UUID on the PDF; ensure cert was issued via the Issue tab |
| Accent colour not applying | Entered an invalid hex value | Use a valid 6-digit hex (e.g. `#a855f7`). The `#` prefix is required. |
| "Below Threshold" student I want to certify | Threshold set too high for this student | Either lower the threshold, or use the individual Issue button for that student |

---

*This guide covers the certificate workflow as of the July 2025 release. For technical issues or feature requests, open an issue on the internal tracker or contact the development team.*
