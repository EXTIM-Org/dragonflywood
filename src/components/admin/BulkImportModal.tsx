"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileUp } from "lucide-react";
import { checkBulkImportProgress } from "@/actions/bulk-import";
import toast from "react-hot-toast";

export function BulkImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [jobState, setJobState] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ processed: number, errors: {row: number, message: string}[] } | null>(null);
  const router = useRouter();

  const closeModal = useCallback(() => {
    if (jobState === "active" || jobState === "waiting") {
      toast.success("پردازش در پس‌زمینه ادامه خواهد یافت. می‌توانید به کارهای دیگر بپردازید.");
    }
    setIsOpen(false);
    setFile(null);
    setJobId(null);
    setProgress(0);
    setJobState(null);
    setIsUploading(false);
  }, [jobState]);

  // Poll for progress when a jobId exists
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (jobId && jobState !== "completed" && jobState !== "failed") {
      interval = setInterval(async () => {
        const res = await checkBulkImportProgress(jobId);
        if (res.success) {
          setProgress(typeof res.progress === 'number' ? res.progress : 0);
          setJobState(res.state || "unknown");
          
          if (res.state === "completed") {
            const { processed, errors } = res.result || {};
            setImportResult({ processed: processed || 0, errors: errors || [] });
            
            if (errors && errors.length > 0) {
              toast.error(`آپلود تمام شد. لطفاً خطاهای گزارش‌شده را بررسی کنید.`, { duration: 6000 });
              console.error("خطاهای پردازش گروهی:", errors);
            } else {
              toast.success("آپلود گروهی با موفقیت به پایان رسید!");
            }
          } else if (res.state === "failed") {
            toast.error("خطا در پردازش فایل: " + (res.failedReason || "نامشخص"));
          }
        } else if (res.error === 'Job not found.' && jobState === 'active') {
          // Fallback if the job was deleted from Redis upon completion before we could read it
          setJobState("completed");
          setProgress(100);
          toast.success("احتمالاً پردازش تمام شده است. در حال بارگذاری مجدد اطلاعات...");
          setTimeout(() => {
            closeModal();
            router.refresh();
          }, 2000);
        }
      }, 1000); // Check every second
    }

    return () => clearInterval(interval);
  }, [jobId, jobState, closeModal, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("لطفاً یک فایل ZIP انتخاب کنید.");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      });
      const res = await response.json();
      if (res.success && res.jobId) {
        setJobId(res.jobId);
        setJobState("active");
        toast.success("فایل با موفقیت ارسال شد. در حال پردازش...");
      } else {
        toast.error(res.error || "خطا در آپلود فایل.");
        setIsUploading(false);
      }
    } catch (_error) {
      toast.error("خطای شبکه یا سرور رخ داد.");
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex justify-center items-center gap-1.5 sm:gap-2 w-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-black/10 dark:border-white/10 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/20 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">بروزرسانی گروهی</span>
          <span className="sm:hidden">بروزرسانی</span>
        </button>

        {/* Tooltip Box */}
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-80 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            راهنمای آپلود فایل کالاها
          </h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed text-right">
            <p>۱. یک فایل با فرمت <strong>ZIP</strong> ایجاد کنید.</p>
            <p>۲. در ریشه آن، یک فایل اکسل (<code className="font-mono text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-1 py-0.5 rounded">.xlsx</code>) شامل ستون‌های زیر (به ترتیب) قرار دهید:<br/>
              <span className="block mt-1.5 p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-[10px] text-gray-500 dark:text-gray-400 font-mono text-right leading-relaxed border border-black/5 dark:border-white/5">
                شناسه یکتا (SKU)، لینک محصول (ProductSlug)، نام محصول (ProductName)، لینک دسته‌بندی (CategorySlug)، قیمت پایه (BasePrice)، درصد تخفیف (Discount)، نام تنوع (VariantName)، قیمت تنوع (VariantPrice)، موجودی (StockQuantity)، وزن (Weight)، طول (Length)، عرض (Width)، ارتفاع (Height)
              </span>
            </p>
            <p>۳. عکس‌ها را در پوشه‌ای به نام <code className="font-mono text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-1 py-0.5 rounded">images</code> درون ZIP قرار دهید.</p>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl space-y-2">
              <p><strong>نام‌گذاری عکس:</strong> نام فایل باید برابر با فیلد <strong>SKU</strong> کالا باشد. (مثال: <code className="font-mono text-[10px]">sku-123.jpg</code>)</p>
              <p><strong>برای چند عکس:</strong> از خط تیره و عدد استفاده کنید: <code className="font-mono text-[10px]">sku-123-1.jpg</code> و <code className="font-mono text-[10px]">sku-123-2.jpg</code></p>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-t border-l border-black/10 dark:border-white/10 rotate-45"></div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-full max-w-md overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">بروزرسانی گروهی محصولات</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>شما می‌توانید هزاران محصول را به‌صورت یکجا ایجاد یا ویرایش کنید.</p>
                <ul className="list-disc list-inside me-2 opacity-80">
                  <li>فایل آپلودی باید به صورت **ZIP** باشد.</li>
                  <li>داخل فایل ZIP، یک فایل اکسل (.xlsx) با اطلاعات کالاها قرار دهید.</li>
                  <li>در صورت نیاز به عکس، آنها را در پوشه images با نام برابر با SKU قرار دهید.</li>
                </ul>
              </div>

              {!jobId ? (
                <>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        {file ? <span className="font-semibold text-violet-600">{file.name}</span> : <><span className="font-semibold">کلیک کنید</span> یا فایل ZIP را اینجا رها کنید</>}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept=".zip" onChange={handleFileChange} />
                  </label>

                  <div className="flex justify-between gap-3 pt-2">
                    <button 
                      onClick={closeModal}
                      className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors flex-1"
                    >
                      انصراف
                    </button>
                    <button 
                      onClick={handleUpload}
                      disabled={!file || isUploading}
                      className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? "در حال ارسال..." : "شروع آپلود"}
                    </button>
                  </div>
                </>
              ) : jobState === 'completed' && importResult ? (
                <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                  <div className="flex flex-col items-center justify-center space-y-3 mb-6">
                    {importResult.errors.length > 0 ? (
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      گزارش پردازش کالاها
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      <strong className="text-gray-900 dark:text-white mx-1">{importResult.processed}</strong> سطر با موفقیت در سیستم ثبت یا بروزرسانی شد.
                    </p>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 mb-4">
                      <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-xs">{importResult.errors.length}</span>
                        مورد خطا در اعتبارسنجی فایل وجود داشت:
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2 ps-2 text-right dir-rtl custom-scrollbar">
                        {importResult.errors.map((err, idx) => (
                          <div key={idx} className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg text-xs flex flex-col gap-1 border border-red-100/50 dark:border-red-900/20">
                            <span className="font-semibold text-red-700 dark:text-red-400">ردیف {err.row}:</span>
                            <span className="text-gray-600 dark:text-gray-300">{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      closeModal();
                      router.refresh();
                    }}
                    className="w-full mt-4 px-5 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20"
                  >
                    بستن و بروزرسانی جدول
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">
                      {jobState === 'failed' ? 'خطا در پردازش!' : 'در حال پردازش سرور...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${jobState === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  {jobState === 'failed' && (
                    <button 
                      onClick={closeModal}
                      className="w-full mt-4 px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors"
                    >
                      بستن پنجره
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
