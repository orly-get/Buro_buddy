import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FileText, Upload, X, ArrowRight, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-safe" dir="rtl">
      <header className="bg-surface border-b border-primary-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-primary-400 hover:text-primary transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="text-body">חזרה</span>
          </Link>
          <h1 className="text-h2 text-text flex-1 text-center">העלאת מכתב</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6">
        {error && (
          <div className="card bg-error/5 border border-error/20 text-error mb-6">
            {error}
          </div>
        )}

        <div
          className={`card border-2 border-dashed transition-all ${
            selectedFile
              ? 'border-primary bg-primary-50'
              : 'border-border-input bg-surface hover:border-primary-300'
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
            <div className="text-center py-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-card mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
              )}

              <p className="text-body text-text font-medium">{selectedFile.name}</p>
              <p className="text-caption text-primary-400 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-2 text-caption text-primary-400 hover:text-error transition-colors mt-4"
              >
                <X className="w-4 h-4" />
                הסר קובץ
              </button>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer block py-8 text-center">
              <div className="w-20 h-20 bg-primary-50 rounded-card flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <p className="text-h2 text-text mb-2">
                גרור קובץ לכאן
              </p>
              <p className="text-body text-primary-400 mb-4">
                או לחץ לבחירת קובץ
              </p>
              <p className="text-caption text-primary-300">
                תמונות (JPG, PNG) או PDF
              </p>
            </label>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || processing}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              !selectedFile || uploading || processing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {(uploading || processing) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? 'מעלה...' : 'מנתח את המכתב...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                העלה ונתח מכתב
              </>
            )}
          </button>
        </div>

        <div className="card mt-6">
          <h3 className="text-h2 text-text mb-4">טיפים להעלאה מוצלחת:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-body text-primary-400">
              <span className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center text-primary text-caption flex-shrink-0">1</span>
              וודא שהתמונה ברורה וממוקדת
            </li>
            <li className="flex items-start gap-3 text-body text-primary-400">
              <span className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center text-primary text-caption flex-shrink-0">2</span>
              הטקסט בתמונה צריך להיות קריא וברור
            </li>
            <li className="flex items-start gap-3 text-body text-primary-400">
              <span className="w-6 h-6 bg-primary-50 rounded-full flex items-center justify-center text-primary text-caption flex-shrink-0">3</span>
              קבצי PDF צריכים להכיל טקסט שניתן לבחירה
            </li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
