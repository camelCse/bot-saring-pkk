const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('⏳ Memulai bot S.A.R.I.N.G... mohon tunggu.');

const client = new Client({
    authStrategy: new LocalAuth(),
    qrMaxRetries: 30, // ← 30 percobaan QR (~30 menit), bukan 7
    puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n✅ QR Code diterima! Silakan scan dengan WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n📱 WhatsApp → Perangkat Tertaut → Tautkan Perangkat → Scan QR.\n');
});

client.on('ready', () => {
    console.log('✅ Bot S.A.R.I.N.G. sudah siap dan terhubung!');
});

client.on('authenticated', () => {
    console.log('🔐 Autentikasi berhasil.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Autentikasi gagal:', msg);
});

client.on('error', (err) => {
    console.error('❌ Error pada client:', err.message || err);
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading WhatsApp Web: ${percent}% - ${message}`);
});

// Logika utama bot
client.on('message', async (msg) => {
    const pesanMasuk = msg.body.toLowerCase();
    const pesanDiteruskan = msg.isForwarded;

    if (pesanDiteruskan || pesanMasuk.includes('cek') || pesanMasuk.includes('hoax') || pesanMasuk.includes('ai')) {
        const balasan = `Halo Bunda! Terima kasih sudah berhati-hati. Mari kita periksa bersama dengan panduan S.A.R.I.N.G.:
🛑 *S — Stop*
Jangan langsung sebarkan, ya Bun.

👀 *A — Amati*
Perhatikan videonya:
• Apakah gerak bibir dan suara sinkron?
• Apakah wajah tiba-tiba berubah bentuk?

🤔 *R — Ragukan*
Kalau ada yang aneh, curigai sebagai drama AI atau hoax.

🔍 *I — Identifikasi*
Cek ke sumber terpercaya:
• TurnBackHoax.id
• Cekfakta.com

✋ *N — Nyatakan (Jangan Sebar)*
Kalau masih ragu, jangan disebar dulu.

🧠 G — Gunakan Akal Sehat
Bijak & bertanggung jawab. Kalau ragu, diskusikan dulu
Terima kasih sudah menjadi Bunda yang cerdas digital! 💪✨`;
        client.sendMessage(msg.from, balasan);
        console.log(`📩 Membalas pesan dari ${msg.from}`);
    } else {
        const balasanDefault = `Halo Bunda! Saya adalah Bot S.A.R.I.N.G. Kirimkan pesan berantai atau video yang Bunda ragukan ke nomor ini, nanti saya bantu berikan panduan untuk memeriksanya.`;
        client.sendMessage(msg.from, balasanDefault);
    }
});

client.initialize();

// Tangkap error EBUSY agar tidak crash
process.on('unhandledRejection', (reason) => {
    const msg = String(reason && reason.message ? reason.message : reason);
    if (msg.includes('EBUSY') || msg.includes('lockfile')) {
        console.warn('⚠️ Lockfile terkunci (Brave masih berjalan). Bot tidak crash.');
        console.warn('   Tekan Ctrl+C, matikan proses node & brave, jalankan ulang.');
    } else {
        console.error('❌ Unhandled Rejection:', reason);
    }
});

process.on('SIGINT', async () => {
    console.log('\n⏹️ Menghentikan bot...');
    try {
        await client.destroy();  // tutup browser dengan rapi
        console.log('✅ Bot berhenti dengan bersih.');
    } catch (err) {
        console.error('Error saat berhenti:', err.message);
    }
    process.exit(0);
});