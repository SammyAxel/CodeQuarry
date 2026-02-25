/**
 * TermsPage — Syarat & Ketentuan / Terms & Conditions
 * Bilingual (Bahasa Indonesia + English)
 * Required for Midtrans merchant approval
 */

import React, { useState } from 'react';
import { ScrollText, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const LAST_UPDATED = 'Juli 2025 / July 2025';
const CONTACT_EMAIL = 'codequarry.sammy@gmail.com';
const CONTACT_WA_1 = '+62 821-1255-9775';
const CONTACT_WA_2 = '+62 813-131-5166';

// Individual accordion section
function Section({ id, titleId, titleEn, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800/40 transition-colors"
      >
        <div>
          <div className="font-bold text-white">{titleId}</div>
          <div className="text-xs text-gray-500 mt-0.5 italic">{titleEn}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 py-5 border-t border-gray-800 space-y-4 text-sm text-gray-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

function BiParagraph({ id, en }) {
  return (
    <div className="space-y-2">
      <p>{id}</p>
      <p className="text-gray-500 italic text-xs">{en}</p>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/10" />
        <div className="relative max-w-4xl mx-auto px-6 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Syarat &amp; Ketentuan</h1>
              <p className="text-gray-400 text-sm italic">Terms &amp; Conditions</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Terakhir diperbarui / Last updated: <span className="text-gray-300">{LAST_UPDATED}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-3">

        {/* Preamble */}
        <div className="p-5 bg-purple-900/10 border border-purple-800/30 rounded-xl text-sm text-gray-300 space-y-3 leading-relaxed mb-6">
          <p>
            Dengan mengakses atau menggunakan layanan CodeQuarry, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat &amp; Ketentuan ini. Harap baca dengan seksama sebelum mendaftar atau melakukan pembayaran.
          </p>
          <p className="text-gray-500 text-xs italic">
            By accessing or using CodeQuarry services, you confirm that you have read, understood, and agreed to these Terms &amp; Conditions. Please read carefully before registering or making any payment.
          </p>
        </div>

        {/* 1. Definisi */}
        <Section titleId="1. Definisi" titleEn="1. Definitions">
          <BiParagraph
            id={`"CodeQuarry" merujuk pada platform pembelajaran pemrograman online yang dioperasikan oleh pemilik platform ini, dapat dihubungi melalui email ${CONTACT_EMAIL}.`}
            en={`"CodeQuarry" refers to the online programming learning platform operated by the platform owner, reachable at ${CONTACT_EMAIL}.`}
          />
          <BiParagraph
            id='"Pengguna" atau "Anda" merujuk pada siapapun yang mengakses website, mendaftar akun, atau melakukan pembelian pada platform CodeQuarry.'
            en='"User" or "You" refers to anyone who accesses the website, creates an account, or makes a purchase on the CodeQuarry platform.'
          />
          <BiParagraph
            id='"Batch" merujuk pada program kelas live berbayar dengan jadwal tetap, instruktur, dan sesi pembelajaran yang terstruktur.'
            en='"Batch" refers to a paid live class program with a fixed schedule, instructor, and structured learning sessions.'
          />
          <BiParagraph
            id='"Sesi" merujuk pada pertemuan kelas individual dalam sebuah batch, yang diselenggarakan secara online melalui platform CodeQuarry.'
            en='"Session" refers to an individual class meeting within a batch, conducted online through the CodeQuarry platform.'
          />
        </Section>

        {/* 2. Layanan */}
        <Section titleId="2. Layanan yang Ditawarkan" titleEn="2. Services Offered">
          <BiParagraph
            id="CodeQuarry menyediakan layanan pembelajaran pemrograman interaktif secara online, meliputi: (a) kursus pemrograman mandiri (self-paced); (b) program Bootcamp berbayar (Batch) dengan sesi live bersama instruktur; (c) acara belajar gratis (Free Events) yang terbuka untuk umum."
            en="CodeQuarry provides interactive online programming education services, including: (a) self-paced programming courses; (b) paid live Bootcamp programs (Batches) with instructor-led sessions; (c) free public learning events (Free Events)."
          />
          <BiParagraph
            id="Akses ke sesi Batch hanya diberikan kepada pengguna yang telah menyelesaikan pembayaran dan mendapat konfirmasi dari CodeQuarry."
            en="Access to Batch sessions is only granted to users who have completed payment and received confirmation from CodeQuarry."
          />
        </Section>

        {/* 3. Pendaftaran & Akun */}
        <Section titleId="3. Pendaftaran &amp; Akun" titleEn="3. Registration &amp; Account">
          <BiParagraph
            id="Untuk menggunakan layanan berbayar, Anda wajib membuat akun dengan informasi yang akurat dan terkini. Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan semua aktivitas dalam akun Anda."
            en="To use paid services, you must create an account with accurate and up-to-date information. You are solely responsible for keeping your password confidential and for all activities under your account."
          />
          <BiParagraph
            id="Pengguna harus berusia minimal 13 tahun. Pengguna di bawah 18 tahun harus mendapat persetujuan orang tua atau wali sebelum melakukan pembelian."
            en="Users must be at least 13 years old. Users under 18 must obtain parental or guardian consent before making any purchase."
          />
        </Section>

        {/* 4. Pembayaran */}
        <Section titleId="4. Pembayaran" titleEn="4. Payment">
          <BiParagraph
            id="Semua transaksi menggunakan mata uang Rupiah Indonesia (IDR). CodeQuarry menerima dua metode pembayaran:"
            en="All transactions use Indonesian Rupiah (IDR). CodeQuarry accepts two payment methods:"
          />
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <span className="font-medium text-white">Pembayaran Online / Online Payment</span>
              <span className="text-gray-400"> — melalui Midtrans Snap (GoPay, OVO, QRIS, kartu kredit, transfer bank virtual account). / via Midtrans Snap (GoPay, OVO, QRIS, credit card, virtual account bank transfer).</span>
            </li>
            <li>
              <span className="font-medium text-white">Transfer Manual / Manual Bank Transfer</span>
              <span className="text-gray-400"> — transfer langsung ke rekening CodeQuarry, diikuti dengan pengiriman bukti transfer. Konfirmasi dilakukan oleh tim CodeQuarry dalam 1×24 jam kerja. / direct bank transfer to CodeQuarry's account, followed by submitting proof of transfer. Confirmation is processed within 1×24 business hours.</span>
            </li>
          </ul>
          <BiParagraph
            id="Harga yang tertera pada halaman program adalah harga final. CodeQuarry berhak mengubah harga sewaktu-waktu sebelum pendaftaran dilakukan."
            en="Prices displayed on the program page are final. CodeQuarry reserves the right to change prices at any time before enrollment is completed."
          />
          <BiParagraph
            id="Akses ke sesi Batch akan diaktifkan setelah pembayaran terverifikasi. Untuk transfer manual, aktivasi dilakukan setelah konfirmasi oleh tim CodeQuarry."
            en="Access to Batch sessions will be activated after payment verification. For manual transfers, activation occurs after confirmation by the CodeQuarry team."
          />
        </Section>

        {/* 5. Kebijakan Pengembalian Dana */}
        <Section titleId="5. Kebijakan Pengembalian Dana" titleEn="5. Refund Policy">
          <BiParagraph
            id="CodeQuarry memahami bahwa setiap situasi berbeda. Kebijakan pengembalian dana ditangani secara individual dengan mempertimbangkan kondisi berikut:"
            en="CodeQuarry understands that every situation is different. Refund requests are handled on a case-by-case basis, taking into account the following conditions:"
          />
          <ul className="list-disc list-inside space-y-2 ml-2 text-gray-300">
            <li>
              <span className="font-medium text-white">Pembatalan oleh CodeQuarry:</span>
              <span> Jika suatu Batch dibatalkan oleh CodeQuarry (bukan karena kesalahan pengguna), pengguna berhak mendapat pengembalian dana penuh. / </span>
              <span className="text-gray-500 italic text-xs">If a Batch is cancelled by CodeQuarry (not due to user error), the user is entitled to a full refund.</span>
            </li>
            <li>
              <span className="font-medium text-white">Pembatalan oleh Pengguna:</span>
              <span> Pengguna dapat mengajukan permohonan refund sebelum Batch dimulai. Keputusan final ada pada pihak CodeQuarry dan akan dikomunikasikan dalam 3 hari kerja. / </span>
              <span className="text-gray-500 italic text-xs">Users may submit a refund request before the Batch begins. The final decision rests with CodeQuarry and will be communicated within 3 business days.</span>
            </li>
            <li>
              <span className="font-medium text-white">Setelah Batch Dimulai:</span>
              <span> Umumnya tidak ada pengembalian dana setelah sesi pertama berlangsung, kecuali ada kondisi khusus yang dapat dipertanggungjawabkan. / </span>
              <span className="text-gray-500 italic text-xs">Generally no refund after the first session has taken place, unless there are verifiable special circumstances.</span>
            </li>
          </ul>
          <BiParagraph
            id={`Untuk mengajukan permohonan refund, hubungi kami di ${CONTACT_EMAIL} dengan menyertakan nama akun, nomor referensi pembayaran, dan alasan permohonan.`}
            en={`To submit a refund request, contact us at ${CONTACT_EMAIL} with your account name, payment reference number, and reason for the request.`}
          />
        </Section>

        {/* 6. Kewajiban Pengguna */}
        <Section titleId="6. Kewajiban Pengguna" titleEn="6. User Obligations">
          <BiParagraph
            id="Pengguna wajib menggunakan platform CodeQuarry hanya untuk tujuan yang sah dan sesuai dengan ketentuan ini. Pengguna dilarang:"
            en="Users must use the CodeQuarry platform only for lawful purposes and in accordance with these terms. Users are prohibited from:"
          />
          <ul className="list-disc list-inside space-y-1 ml-2 text-gray-400">
            <li>Berbagi akun atau akses sesi dengan pihak lain yang tidak terdaftar. / Sharing account or session access with unregistered third parties.</li>
            <li>Merekam, mendistribusikan, atau menyebarkan materi sesi tanpa izin tertulis. / Recording, distributing, or spreading session materials without written permission.</li>
            <li>Menggunakan platform untuk tujuan ilegal, penipuan, atau pelecehan. / Using the platform for illegal, fraudulent, or harassing purposes.</li>
            <li>Mencoba meretas atau mengganggu fungsi platform. / Attempting to hack or disrupt platform functionality.</li>
          </ul>
          <BiParagraph
            id="Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan atau penghapusan akun tanpa pengembalian dana."
            en="Violations of these terms may result in account suspension or deletion without refund."
          />
        </Section>

        {/* 7. Hak Kekayaan Intelektual */}
        <Section titleId="7. Hak Kekayaan Intelektual" titleEn="7. Intellectual Property">
          <BiParagraph
            id="Seluruh konten pada platform CodeQuarry — termasuk kurikulum, materi kursus, soal latihan, video, teks, grafis, dan kode sumber — adalah milik CodeQuarry dan dilindungi hukum hak cipta yang berlaku."
            en="All content on the CodeQuarry platform — including curriculum, course materials, exercises, videos, text, graphics, and source code — is the property of CodeQuarry and is protected by applicable copyright law."
          />
          <BiParagraph
            id="Pengguna diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan untuk menggunakan konten semata-mata untuk keperluan pembelajaran pribadi."
            en="Users are granted a limited, non-exclusive, non-transferable license to use content solely for personal learning purposes."
          />
        </Section>

        {/* 8. Privasi */}
        <Section titleId="8. Privasi &amp; Data Pengguna" titleEn="8. Privacy &amp; User Data">
          <BiParagraph
            id="CodeQuarry mengumpulkan data pribadi yang diperlukan untuk menjalankan layanan (nama, email, data progres belajar, dan informasi pembayaran). Data ini digunakan semata-mata untuk tujuan operasional platform dan tidak dijual atau dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum."
            en="CodeQuarry collects personal data necessary to provide services (name, email, learning progress data, and payment information). This data is used solely for platform operational purposes and is not sold or shared with third parties without your consent, except as required by law."
          />
          <BiParagraph
            id="Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan data sebagaimana dijelaskan di atas."
            en="By using our services, you consent to the collection and use of data as described above."
          />
        </Section>

        {/* 9. Penafian */}
        <Section titleId="9. Penafian &amp; Batasan Tanggung Jawab" titleEn="9. Disclaimer &amp; Limitation of Liability">
          <BiParagraph
            id='Layanan CodeQuarry disediakan "sebagaimana adanya" tanpa jaminan apapun, baik tersurat maupun tersirat. CodeQuarry tidak menjamin hasil pembelajaran tertentu kepada setiap pengguna.'
            en='CodeQuarry services are provided "as is" without any warranties, express or implied. CodeQuarry does not guarantee specific learning outcomes for any user.'
          />
          <BiParagraph
            id="Dalam batas yang diizinkan oleh hukum, CodeQuarry tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan."
            en="To the fullest extent permitted by law, CodeQuarry is not liable for any indirect, incidental, or consequential damages arising from the use or inability to use the services."
          />
        </Section>

        {/* 10. Perubahan T&C */}
        <Section titleId="10. Perubahan Syarat &amp; Ketentuan" titleEn="10. Changes to Terms &amp; Conditions">
          <BiParagraph
            id="CodeQuarry berhak mengubah Syarat & Ketentuan ini kapan saja. Perubahan akan diberitahukan melalui email terdaftar atau pengumuman di platform. Penggunaan layanan setelah perubahan dianggap sebagai penerimaan terhadap ketentuan yang diperbarui."
            en="CodeQuarry reserves the right to modify these Terms & Conditions at any time. Changes will be notified via registered email or a platform announcement. Continued use of the service after changes constitutes acceptance of the updated terms."
          />
        </Section>

        {/* 11. Hukum yang Berlaku */}
        <Section titleId="11. Hukum yang Berlaku" titleEn="11. Governing Law">
          <BiParagraph
            id="Syarat & Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Segala sengketa yang timbul akan diselesaikan melalui musyawarah mufakat terlebih dahulu, dan jika tidak tercapai kesepakatan, akan diselesaikan melalui jalur hukum yang berlaku di Indonesia."
            en="These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes shall first be resolved through amicable negotiation, and if no agreement is reached, through applicable legal channels in Indonesia."
          />
        </Section>

        {/* 12. Sertifikat Penyelesaian */}
        <Section titleId="12. Sertifikat Penyelesaian" titleEn="12. Certificates of Completion">
          <BiParagraph
            id="CodeQuarry menerbitkan Sertifikat Penyelesaian kepada peserta yang telah memenuhi syarat kehadiran dan partisipasi dalam program Bootcamp. Sertifikat ini merupakan pengakuan atas penyelesaian program pelatihan dan bukan merupakan kualifikasi akademik atau profesi yang terakreditasi."
            en="CodeQuarry issues Certificates of Completion to participants who have met the attendance and participation requirements of a Bootcamp program. These certificates acknowledge completion of a training program and are not accredited academic or professional qualifications."
          />
          <BiParagraph
            id="Setiap sertifikat dilengkapi dengan UUID (Universally Unique Identifier) yang unik. Siapa pun dapat memverifikasi keaslian sertifikat melalui halaman verifikasi publik di codequarry.app/verify/<uuid>. UUID yang tercetak pada sertifikat harus cocok dengan hasil verifikasi online untuk membuktikan keasliannya."
            en="Each certificate includes a unique UUID (Universally Unique Identifier). Anyone may verify the authenticity of a certificate through the public verification page at codequarry.app/verify/<uuid>. The UUID printed on the certificate must match the online verification result to establish authenticity."
          />
          <BiParagraph
            id="CodeQuarry berhak mencabut atau membatalkan sertifikat yang diterbitkan apabila ditemukan bukti kecurangan, pelanggaran Syarat & Ketentuan, atau kesalahan administrasi. Sertifikat yang dicabut tidak lagi dapat diverifikasi melalui sistem."
            en="CodeQuarry reserves the right to revoke or void any issued certificate if evidence of fraud, violation of these Terms, or administrative error is discovered. Revoked certificates will no longer be verifiable through the system."
          />
          <BiParagraph
            id="Nama lengkap peserta yang dicantumkan dalam sertifikat diproses dan disimpan sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) yang berlaku di Indonesia. Peserta dapat mengajukan permintaan koreksi atau penghapusan data melalui email resmi CodeQuarry. Penghapusan data dapat mengakibatkan sertifikat terkait tidak dapat diverifikasi."
            en="The participant's full name appearing on the certificate is processed and stored in accordance with Indonesia's Personal Data Protection Law (UU PDP). Participants may request correction or deletion of their data via CodeQuarry's official email. Data deletion may result in the associated certificate becoming unverifiable."
          />
          <BiParagraph
            id="Sertifikat CodeQuarry tidak menjamin penerimaan kerja, kenaikan jabatan, atau hasil profesional tertentu. Pengguna bertanggung jawab atas cara mereka mempresentasikan sertifikat kepada pihak ketiga."
            en="A CodeQuarry certificate does not guarantee employment, promotion, or any specific professional outcome. Users are responsible for how they present certificates to third parties."
          />
        </Section>

        {/* Contact Section */}
        <div className="mt-8 p-6 bg-gray-900/60 border border-gray-700 rounded-2xl">
          <h2 className="text-lg font-black text-white mb-1">Hubungi Kami</h2>
          <p className="text-gray-500 text-sm italic mb-5">Contact Us</p>
          <p className="text-sm text-gray-400 mb-5">
            Jika Anda memiliki pertanyaan tentang Syarat &amp; Ketentuan ini atau ingin mengajukan permohonan refund, hubungi kami melalui:
            <span className="block text-xs text-gray-600 italic mt-1">If you have questions about these Terms or wish to submit a refund request, reach us at:</span>
          </p>
          <div className="space-y-3">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 group-hover:bg-purple-600/30 flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Email</div>
                <div className="font-bold text-white">{CONTACT_EMAIL}</div>
              </div>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[CONTACT_WA_1, CONTACT_WA_2].map((num) => (
                <a
                  key={num}
                  href={`https://wa.me/${num.replace(/[\s+-]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 group-hover:bg-green-600/30 flex items-center justify-center transition-colors">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">WhatsApp</div>
                    <div className="font-bold text-white">{num}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-4">
            Waktu respons: 1–2 hari kerja / <span className="italic">Response time: 1–2 business days</span>
          </p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-600 mt-8">
        © {new Date().getFullYear()} CodeQuarry. Hak cipta dilindungi. / All rights reserved.
      </div>
    </div>
  );
}
