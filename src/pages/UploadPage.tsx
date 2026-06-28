import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      setError(null);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('letters')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('letters')
        .getPublicUrl(fileName);

      const { data: letter, error: dbError } = await supabase
        .from('letters')
        .insert({
          user_id: user.id,
          file_url: publicUrl,
          status: 'processing',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setProcessing(true);

      const { data: { session } } = await supabase.auth.getSession();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mtwlmvstxemicebioxdn.supabase.co';

      const payload = selectedFile.type.startsWith('image/')
        ? { text: `תמונה של מכתב רשמי שהועלתה למערכת. שם הקובץ: ${selectedFile.name}. נתח את המכתב וספק תקציר ומשימות לפי הפורמט הנדרש.`, mimeType: selectedFile.type }
        : { text: `מסמך PDF שהועלה למערכת. שם הקובץ: ${selectedFile.name}. נתח את המכתב וספק תקציר ומשימות לפי הפורמט הנדרש.` };

      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-letter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.summary) {
          await supabase.from('ai_summaries').insert({
            letter_id: letter.id,
            summary_text: result.summary,
          });
        }

        if (result.tasks && result.tasks.length > 0) {
          const tasksToInsert = result.tasks.map((task: { description: string; due_date: string | null }) => ({
            letter_id: letter.id,
            task_description: task.description,
            due_date: task.due_date,
          }));

          await supabase.from('tasks').insert(tasksToInsert);
        }

        if (result.category) {
          const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .eq('name', result.category)
            .single();

          if (categories) {
            await supabase
              .from('letters')
              .update({ category_id: categories.id })
              .eq('id', letter.id);
          }
        }

        await supabase
          .from('letters')
          .update({ status: 'completed' })
          .eq('id', letter.id);
      } else {
        await supabase
          .from('letters')
          .update({ status: 'failed' })
          .eq('id', letter.id);
        throw new Error('Failed to analyze letter');
      }

      navigate(`/letter/${letter.id}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError('אירעה שגיאה בהעלאת המכתב. אנא נסה שוב.');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col font-body-lg text-on-surface" dir="rtl">
      {/* TopAppBar */}
      <header className="bg-white shadow-[0_8px_30px_rgb(255,107,138,0.12)] flex justify-between items-center px-4 py-4 w-full sticky top-0 z-50 rounded-b-[32px]">
        <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl text-primary hover:bg-pink-50 transition-colors active:scale-95">
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
        <span className="text-xl font-black text-on-surface">סריקת מכתב</span>
        <div className="w-10 h-10" /> {/* Spacer to align title center */}
      </header>

      <main className="flex-1 max-w-xl mx-auto px-5 py-6 space-y-6 w-full">
        {error && (
          <div className="flex justify-between items-center bg-error-container/30 px-4 py-3 rounded-2xl border border-error/10">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="font-caption font-bold">{error}</span>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          className={`relative overflow-hidden rounded-[32px] border-2 border-dashed transition-all duration-300 ${
            selectedFile
              ? 'border-primary bg-primary-container/5 shadow-[0_10px_40px_rgba(255,107,138,0.1)]'
              : 'border-pink-200 bg-surface-container-low hover:bg-pink-50 hover:border-primary-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />

          {selectedFile ? (
            <div className="p-8 text-center relative z-10">
              {preview ? (
                <div className="relative inline-block mb-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 object-contain rounded-2xl shadow-lg border border-pink-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-2xl pointer-events-none"></div>
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
              )}

              <p className="font-h2 text-on-surface line-clamp-1 px-4">{selectedFile.name}</p>
              <p className="font-caption text-on-surface-variant mt-1 mb-6">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-surface-container-high text-on-surface-variant hover:bg-error-container hover:text-error transition-all font-button text-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                הסר קובץ
              </button>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer block p-10 text-center relative z-10">
              <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(255,107,138,0.1)] border border-pink-50">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
              </div>
              <p className="font-h2 text-on-surface mb-2">
                גרור קובץ לכאן
              </p>
              <p className="font-body-sm text-on-surface-variant mb-6">
                או לחץ לבחירת קובץ
              </p>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-pink-50">
                <span className="font-caption text-primary font-bold tracking-wide uppercase">JPG, PNG, PDF</span>
              </div>
            </label>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || processing}
          className={`w-full h-[56px] flex items-center justify-center gap-3 rounded-full font-button text-lg transition-all duration-300 ${
            !selectedFile || uploading || processing 
              ? 'bg-surface-variant text-on-surface-variant opacity-70 cursor-not-allowed' 
              : 'bg-primary-container text-on-primary shadow-[0_10px_25px_rgba(255,107,138,0.3)] hover:scale-[1.02] active:scale-95'
          }`}
        >
          {(uploading || processing) ? (
            <>
              <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
              <span>{uploading ? 'מעלה...' : 'מנתח את המכתב...'}</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
              <span>העלה ונתח מכתב</span>
            </>
          )}
        </button>

        {/* Tips Section */}
        <section className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(255,107,138,0.08)] border border-pink-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
            <h3 className="font-h2 text-on-surface">טיפים לסריקה מוצלחת</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary font-bold text-xs shrink-0 mt-0.5">1</span>
              <p className="font-body-sm text-on-surface-variant">וודא שהתמונה מוארת היטב, ברורה וממוקדת</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary font-bold text-xs shrink-0 mt-0.5">2</span>
              <p className="font-body-sm text-on-surface-variant">הטקסט במסמך צריך להיות קריא וברור לחלוטין</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary font-bold text-xs shrink-0 mt-0.5">3</span>
              <p className="font-body-sm text-on-surface-variant">לקבצי PDF, וודא שהם מכילים טקסט אמיתי (לא רק תמונות)</p>
            </li>
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
