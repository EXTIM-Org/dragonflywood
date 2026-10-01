"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import { deleteProduct } from "@/actions/product";

export function DeleteButton({ productId }: { productId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProduct(productId);
      if (res?.error) {
        toast.error(res.error);
        setIsOpen(false);
      } else {
        toast.success("محصول با موفقیت حذف شد.");
        setIsOpen(false);
      }
    } catch {
      toast.error("خطای سیستمی رخ داد.");
    } finally {
      setIsDeleting(false);
    }
  };

  const modal = mounted && isOpen ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isDeleting && setIsOpen(false)}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center z-10 animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <button 
          onClick={() => !isDeleting && setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          disabled={isDeleting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">حذف محصول</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
          آیا از حذف این محصول اطمینان دارید؟<br/>
          این عملیات غیرقابل بازگشت است.
        </p>
        
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => !isDeleting && setIsOpen(false)}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            انصراف
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
          >
            {isDeleting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>حذف کن</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button 
        type="button" 
        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" 
        title="حذف" 
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="w-5 h-5" />
      </button>
      {modal}
    </>
  );
}
