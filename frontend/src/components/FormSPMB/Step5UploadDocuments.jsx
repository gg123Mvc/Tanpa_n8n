import React, { useState, useRef } from 'react';
import { useFormStore } from '../../context/store';
import { isValidFileType, isValidFileSize, formatFileSize } from '../../utils/validation';
import { FiUpload, FiX, FiCheck, FiEye, FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Step5UploadDocuments = ({ onNext, onPrev }) => {
  const { formData, updateFormData } = useFormStore();
  const [preview, setPreview] = useState(null);

  const requiredDocuments = [
    { type: 'photo', label: 'Pas Foto 3x4', desc: 'Background Merah/Biru', icon: '📷' },
    { type: 'family_card', label: 'Kartu Keluarga', desc: 'Scan/Foto Jelas', icon: '👨‍👩‍👧‍👦' },
    { type: 'birth_certificate', label: 'Akta Kelahiran', desc: 'Scan/Foto Jelas', icon: '📋' },
    { type: 'report_card', label: 'Ijazah / SKL', desc: 'Halaman Depan & Belakang', icon: '🎓' },
  ];

  const handleFileSelect = (file, docType) => {
    if (!isValidFileType(file.name, ['jpg', 'jpeg', 'png', 'pdf'])) {
      toast.error('Format harus JPG, PNG, atau PDF');
      return;
    }
    if (!isValidFileSize(file.size)) {
      toast.error('Maksimal ukuran file 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = {
        type: docType,
        file: file,
        name: file.name,
        size: file.size,
        preview: e.target.result,
        uploadedAt: new Date()
      };

      const documents = formData.documents || [];
      const existingIndex = documents.findIndex(doc => doc.type === docType);
      
      if (existingIndex >= 0) documents[existingIndex] = fileData;
      else documents.push(fileData);

      updateFormData({ documents });
      toast.success('File berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docType) => {
    const documents = formData.documents.filter(doc => doc.type !== docType);
    updateFormData({ documents });
    toast.success('File dihapus');
  };

  const handleNext = () => {
    const documents = formData.documents || [];
    if (documents.length < requiredDocuments.length) {
      toast.error('Silakan lengkapi semua dokumen wajib');
      return;
    }
    onNext();
  };

  const uploadProgress = Math.round((formData.documents?.length || 0) / requiredDocuments.length * 100);

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-12 border border-emerald-50">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
              <FiUpload /> BERKAS DIGITAL
            </div>
            <h2 className="text-3xl font-bold text-emerald-950">Unggah Dokumen Syarat</h2>
            <p className="text-gray-500 mt-2">Pastikan dokumen terbaca dengan jelas (tidak buram/gelap).</p>
          </div>
          
          <div className="w-full md:w-48">
            <div className="flex justify-between text-[10px] font-bold text-emerald-700 mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-emerald-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-700"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requiredDocuments.map((doc) => {
            const uploaded = formData.documents?.find(d => d.type === doc.type);

            return (
              <div key={doc.type} className={`group relative rounded-[2rem] border-2 border-dashed p-6 transition-all duration-300 ${
                uploaded ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50'
              }`}>
                {!uploaded ? (
                  <label className="cursor-pointer flex flex-col items-center text-center">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileSelect(e.target.files[0], doc.type)}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      {doc.icon}
                    </div>
                    <div className="font-bold text-emerald-950">{doc.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{doc.desc}</div>
                    <div className="mt-4 px-4 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl border border-emerald-50 shadow-sm">
                      Pilih File
                    </div>
                  </label>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <FiCheck size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-emerald-950 truncate">{doc.label}</div>
                        <div className="text-[10px] text-emerald-600 font-bold truncate uppercase">{uploaded.name}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={() => setPreview(uploaded)}
                        className="flex-1 py-2.5 bg-white text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiEye /> Lihat
                      </button>
                      <button 
                        onClick={() => handleRemoveFile(doc.type)}
                        className="flex-1 py-2.5 bg-white text-red-500 text-[10px] font-bold rounded-xl border border-red-50 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiX /> Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
          <FiInfo className="text-amber-600 shrink-0 mt-1" size={20} />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            <strong>Catatan:</strong> Maksimal ukuran file adalah 5MB. Pastikan file dalam format JPG, PNG, atau PDF. Jika dokumen terdiri dari beberapa halaman (seperti raport), silakan gabungkan menjadi satu file PDF.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-gray-100 mt-10">
          <button type="button" onClick={onPrev} className="btn-secondary flex-1">
            <FiArrowLeft /> Kembali
          </button>
          <button type="button" onClick={handleNext} className="btn-primary flex-1">
             Lanjut ke Ringkasan <FiArrowRight />
          </button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/80 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex justify-between items-center bg-emerald-900 text-white">
              <div className="font-bold">{preview.name}</div>
              <button onClick={() => setPreview(null)} className="p-2 hover:bg-white/10 rounded-full">&times;</button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-auto">
              {preview.preview.startsWith('data:image') ? (
                <img src={preview.preview} alt="Preview" className="w-full rounded-2xl shadow-lg" />
              ) : (
                <div className="text-center py-20 text-gray-400">
                   📄 Pratinjau PDF tidak tersedia di browser ini. Silakan download untuk melihat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5UploadDocuments;
