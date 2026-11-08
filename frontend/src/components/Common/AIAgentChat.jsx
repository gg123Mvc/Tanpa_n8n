import React, { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const AIAgentChat = () => {
  useEffect(() => {
    const webhookUrl =
      import.meta.env.VITE_N8N_WEBHOOK_URL ||
      'https://sekolahku-sekolahku.t4t2am.easypanel.host/webhook/470d12f5-4c3d-4234-b5bd-7a13e88779f5/chat';

    createChat({
      webhookUrl,
      mode: 'window',
      showWelcomeScreen: false,
      initialMessages: [
        '👋 Selamat Datang di MAIRA AI — Madrasah AI Response Assistant MA Bina Cendekia!\n\nSaya siap membantu Anda terkait layanan Sistem Penerimaan Murid Baru (SPMB).\n\nContoh pertanyaan:\n🔹 Apa saja syarat pendaftaran?\n🔹 Berapa biaya sekolah?\n🔹 Bagaimana cara daftar?\n🔹 Cek kelulusan (REG202600123)\n🔹 Cek tiket pengaduan (CMP-20260710-00015)'
      ],
      i18n: {
        en: {
          title: 'MAIRA AI 🤖',
          subtitle: 'Madrasah AI Response Assistant',
          footer: '',
          getStarted: 'Mulai Percakapan',
          inputPlaceholder: 'Tanyakan sesuatu...',
          closeButtonTooltip: 'Tutup',
        },
      },
    });
  }, []);

  return null;
};

export default AIAgentChat;
