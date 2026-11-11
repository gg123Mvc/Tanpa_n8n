import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiSend, FiTrash2, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { FaRobot, FaUser } from 'react-icons/fa';
import { useAIAgentStore } from '../../context/store';
import { aiAgentAPI } from '../../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    chatHistory,
    setChatHistory,
    setLoading: setAILoading,
    addUserMessageOnly,
    updateMessageResponse
  } = useAIAgentStore();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  const formatResponseTime = (ms) => {
    if (ms === undefined || ms === null || ms === '') return '';
    const num = Number(ms);
    if (isNaN(num)) return '';
    return `${num.toLocaleString('id-ID')} ms`;
  };

  const markdownComponents = {
    table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="w-full text-left border-collapse" {...props} /></div>,
    th: ({node, ...props}) => <th className="border border-gray-300 py-1.5 px-2 bg-gray-100 font-semibold text-gray-700 text-[11px]" {...props} />,
    td: ({node, ...props}) => <td className="border border-gray-200 py-1.5 px-2 text-[11px]" {...props} />,
    p: ({node, ...props}) => <p className="mb-1.5 last:mb-0" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5" {...props} />,
    li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />
  };

  const welcomeMessageText = `👋 **Selamat Datang di MAIRA AI**

**Madrasah AI Response Assistant**

**MA Bina Cendekia**

Saya siap membantu Anda terkait layanan Sistem Penerimaan Murid Baru (SPMB).

Silakan ketik pertanyaan atau kebutuhan Anda, misalnya:

🔹 Apa saja syarat pendaftaran?

🔹 Berapa biaya sekolah?

🔹 Bagaimana cara daftar?

🔹 Saya tidak bisa upload rapor.

🔹 Website error saat login.

🔹 Cek kelulusan. (Masukan Nomor Registrasi Anda, Contoh: REG202600123)

🔹 Cek tiket pengaduan. (Masukan Nomor Tiket Pengaduan Anda, Contoh: CMP-20260710-00015)

📍 **Cek Jarak ke Sekolah** — Gunakan tombol **Cek Jarak** di halaman ini untuk menghitung jarak dari lokasi GPS Anda ke sekolah secara akurat.

💡 Anda tidak perlu menggunakan format khusus. Cukup ketik pertanyaan atau permasalahan Anda, dan MAIRA AI akan membantu memprosesnya secara otomatis.`;

  // Set initial welcome message on mount (tanpa database)
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        aiResponse: welcomeMessageText,
        timestamp: new Date().toISOString(),
        aiTimestamp: new Date().toISOString(),
        isWelcomeMessage: true
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const getSessionId = () => {
    let sid = localStorage.getItem('n8n-chat/sessionId');
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('n8n-chat/sessionId', sid);
    }
    return sid;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    const userMsg = message.trim();
    const tempId = Date.now();
    const sendTime = new Date();
    const clientStartTime = Date.now();

    // Add user message immediately
    addUserMessageOnly(tempId, userMsg, sendTime);
    setMessage('');

    // Auto-scroll after adding the message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    setLoading(true);
    setAILoading(true);

    const n8nWebhookUrl =
      import.meta.env.VITE_N8N_WEBHOOK_URL ||
      'https://sekolahku-sekolahku.t4t2am.easypanel.host/webhook/470d12f5-4c3d-4234-b5bd-7a13e88779f5/chat';

    const sessionId = getSessionId();

    try {
      // 1. Panggil langsung webhook n8n menggunakan native fetch
      // Native fetch dengan headers Content-Type murni memastikan tidak ada penolakan CORS preflight
      // dan tidak terkena limit timeout 10 detik serverless Vercel.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId,
          chatInput: userMsg,
          message: userMsg
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawText = await response.text();
      let aiResponse = '';

      try {
        const data = JSON.parse(rawText);
        let item = Array.isArray(data) && data.length > 0 ? data[0] : data;
        aiResponse =
          typeof item === 'string'
            ? item
            : (item?.output || item?.text || item?.message || item?.response || item?.data || item?.result || item?.content || JSON.stringify(item));
      } catch {
        // Jika response berupa plain text
        aiResponse = rawText;
      }

      const responseTimeMs = Date.now() - clientStartTime;
      const timestamp = new Date();

      updateMessageResponse(tempId, aiResponse, timestamp, responseTimeMs);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (n8nError) {
      console.warn('Direct n8n fetch failed, attempting backend proxy...', n8nError);

      try {
        // Fallback melalui backend proxy jika direct fetch gagal
        const contextHistory = chatHistory.slice(-2).map(chat => ({
          user: chat.userMessage || chat.message,
          ai: chat.aiResponse || chat.response
        }));

        const res = await aiAgentAPI.sendMessage(userMsg, contextHistory);

        if (res.data && res.data.success) {
          const aiResponse = res.data.data.ai_response;
          const timestamp = res.data.data.timestamp || new Date();
          const responseTimeMs = res.data.data.response_time_ms ?? (Date.now() - clientStartTime);

          updateMessageResponse(tempId, aiResponse, timestamp, responseTimeMs);

          if (inputRef.current) {
            inputRef.current.focus();
          }
          return;
        }
      } catch (backendError) {
        console.error('Backend proxy also failed:', backendError);
      }

      const errorMsg =
        n8nError.name === 'AbortError'
          ? 'Waktu tunggu respon n8n habis (timeout 60 detik).'
          : (n8nError.message || 'Gagal memproses pesan');

      toast.error(errorMsg);
      console.error('AI Chat Error:', n8nError);

      updateMessageResponse(
        tempId,
        'Maaf, saat ini terjadi kendala koneksi ke server AI. Silakan coba beberapa saat lagi.',
        new Date(),
        Date.now() - clientStartTime
      );
    } finally {
      setLoading(false);
      setAILoading(false);
    }
  };

  const handleClearChat = () => {
    if (!window.confirm('Hapus semua chat?')) return;

    setChatHistory([{
      aiResponse: welcomeMessageText,
      timestamp: new Date().toISOString(),
      aiTimestamp: new Date().toISOString(),
      isWelcomeMessage: true
    }]);
    toast.success('Chat berhasil dihapus');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <FiX className="w-7 h-7 relative z-10" />
        ) : (
          <>
            <FaRobot className="w-8 h-8 relative z-10" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bg-white shadow-2xl flex flex-col animate-slideInUp z-[60] border-t-4 border-primary-600 transition-all duration-300 ${isFullScreen ? 'inset-0 w-full h-full rounded-none' : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] min-h-[400px] max-h-[600px] rounded-lg overflow-hidden'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-lg">MAIRA AI 🤖</h3>
              <p className="text-xs opacity-90">Madrasah AI Response Assistant</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">👋</div>
                <h4 className="font-bold text-gray-800 mb-1.5">Halo! Aku MAIRA AI</h4>
                <p className="text-[12px] text-gray-600">
                  Aku siap membantu menjawab pertanyaan tentang SPMB, syarat pendaftaran, dan informasi sekolah.
                </p>
              </div>
            ) : (
              <>
                {chatHistory.map((chat, index) => (
                  <div key={chat.id || index} className="space-y-2">
                    {/* User Message */}
                    {(chat.userMessage || chat.message) && (
                      <div className="flex justify-end items-start gap-1.5">
                        <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[75%]">
                          <div className="bg-primary-600 text-white rounded-lg rounded-tr-none px-2.5 py-1 shadow-sm min-w-[60px]">
                            <p className="text-[12px] leading-tight">{chat.userMessage || chat.message}</p>
                            <div className="flex justify-end items-center gap-1 mt-0.5 -mb-0.5">
                              <span className="text-[8px] text-primary-200 opacity-90">
                                {formatTime(chat.userTimestamp || chat.timestamp || chat.created_at)}
                              </span>
                              <span className={`text-[10px] leading-none ${chat.aiResponse || chat.response ? 'text-cyan-300' : 'text-gray-300'}`}>
                                ✓✓
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200 mt-0.5">
                          <FaUser className="w-3 h-3 text-primary-600" />
                        </div>
                      </div>
                    )}

                    {/* AI Response or Typing Indicator */}
                    {chat.aiResponse || chat.response ? (
                      <div className="flex justify-start items-start gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300 mt-0.5">
                          <FaRobot className="w-3 h-3 text-primary-600" />
                        </div>
                        <div className="flex flex-col items-start gap-1 max-w-[85%] md:max-w-[85%]">
                          <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-tl-none px-3 py-2 shadow-sm min-w-[60px] max-w-full overflow-hidden">
                            <div className="text-[12px] leading-relaxed markdown-content">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {chat.aiResponse || chat.response || ''}
                              </ReactMarkdown>
                            </div>
                            <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5">
                              <span className="text-[8px] text-gray-400">
                                {formatTime(chat.aiTimestamp || chat.timestamp || chat.created_at)}
                              </span>
                            </div>
                          </div>
                          {(chat.responseTimeMs || chat.response_time_ms) ? (
                            <div className="flex gap-2 items-center text-[8px] text-gray-400 ml-1">
                              <span className="bg-gray-100 px-1 py-0.5 rounded text-gray-500 flex items-center gap-0.5">
                                ⏱️ {formatResponseTime(chat.responseTimeMs || chat.response_time_ms)}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start items-start gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-300 mt-0.5">
                          <FaRobot className="w-3 h-3 text-primary-600" />
                        </div>
                        <div className="flex flex-col items-start gap-1 max-w-[85%] md:max-w-[75%]">
                          <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-tl-none px-2.5 py-1.5 shadow-sm flex gap-1 items-center h-[26px]">
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 rounded-b-lg shrink-0">
            <div className="flex justify-between items-center mb-3">
              {chatHistory.length > 0 ? (
                <button
                  onClick={handleClearChat}
                  className="text-xs text-gray-600 flex items-center gap-1 hover:text-red-600 transition"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Hapus Chat
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-800 transition bg-primary-50 px-2 py-1 rounded"
              >
                {isFullScreen ? <FiMinimize2 className="w-3 h-3" /> : <FiMaximize2 className="w-3 h-3" />}
                {isFullScreen ? "Tampilan Kecil" : "Layar Penuh"}
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Suggestions */}
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-600 font-semibold">Quick Tips:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Syarat pendaftaran',
                  'Upload dokumen',
                  'Informasi jurusan',
                  'Biaya pendaftaran'
                ].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => {
                      setMessage(tip);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition text-left"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAgentChat;
