"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X, Home, LayoutGrid, Tag, ShieldCheck, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/store/CartContext";
import { useEffect, useState } from "react";
import { logoutUser } from "@/actions/auth";
import { usePathname } from "next/navigation";
import { hasAdminPanelAccess } from "@/lib/permissions";

const navLinks = [
  { name: "فروشگاه", href: "/products", icon: Home },
  { name: "دسته‌بندی‌ها", href: "/categories", icon: LayoutGrid },
  { name: "پیشنهادهای ویژه", href: "/offers", icon: Tag },
];

export function Header({ session }: { session: any }) {
  const { totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/70 backdrop-blur-lg transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Right Section: Logo & Mobile Menu */}
        <div className="flex items-center gap-3 md:gap-8">
          <button 
            className="md:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="منوی موبایل"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
              گالری چوب سنجاقک
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2 group relative"
              >
                {link.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Left Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          <Link href="/cart" className="p-2 text-foreground/80 hover:text-violet-600 dark:hover:text-violet-400 transition-colors relative" aria-label="سبد خرید">
            <ShoppingCart className="w-5 h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>
          
          {session ? (
            <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-full">
              <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-violet-600/20 dark:bg-violet-600/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    {session.image ? (
                      <img src={session.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <span className="hidden sm:inline text-gray-700 dark:text-gray-200">سلام، {session.name.split(' ')[0]}</span>
              </Link>
              <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
              {hasAdminPanelAccess(session.role) && !isAdminPage && (
                <>
                  <Link href="/admin" className="hidden sm:inline-block text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-1 rounded-md hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors">
                    پنل ادمین
                  </Link>
                  <div className="hidden sm:block w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                </>
              )}
              <form action={logoutUser}>
                <button type="submit" className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">خروج</button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-[0_0_15px_rgba(81,109,62,0.3)] hover:shadow-[0_0_25px_rgba(81,109,62,0.5)] text-sm font-medium">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">حساب کاربری</span>
            </Link>
          )}
        </div>
        
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 top-16 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="md:hidden absolute top-full left-0 w-full z-50 bg-white dark:bg-gray-950 rounded-b-3xl shadow-2xl border-b border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-all group"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        {link.name}
                      </div>
                      <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-all group-hover:-translate-x-1" />
                    </Link>
                  );
                })}
                {session && hasAdminPanelAccess(session.role) && !isAdminPage && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-bold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-all group mt-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      پنل ادمین
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-all group-hover:-translate-x-1" />
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
