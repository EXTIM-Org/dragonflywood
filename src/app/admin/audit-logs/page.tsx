import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { canManageRoles } from "@/lib/permissions";
import { ShieldAlert, User, Activity, Info, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  
  if (!session || !canManageRoles(session.role as string)) {
    redirect("/admin");
  }

  const page = Number(searchParams.page) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  // Prisma 8 lambda query style
  const [logs, countResult] = await Promise.all([
    db.orm.public.AdminAuditLog
      .orderBy((l) => l.createdAt.desc())
      .include("admin")
      .offset(skip)
      .limit(limit)
      .all(),
    db.orm.public.AdminAuditLog.aggregate((a) => ({ total: a.count() }))
  ]);

  const total = countResult.total;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">گزارشات فعالیت ادمین‌ها (Audit Logs)</h1>
          <p className="text-sm text-gray-500 mt-1">
            مشاهده تاریخچه تمامی تغییرات و فعالیت‌های مدیران سیستم
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">مدیر</th>
                <th className="px-6 py-4 font-bold">عملیات</th>
                <th className="px-6 py-4 font-bold">بخش / موجودیت</th>
                <th className="px-6 py-4 font-bold">توضیحات</th>
                <th className="px-6 py-4 font-bold">IP / UserAgent</th>
                <th className="px-6 py-4 font-bold">زمان ثبت</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                let actionColor = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                const ActionIcon = Activity;
                if (log.action === "CREATE") actionColor = "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
                if (log.action === "UPDATE" || log.action === "SETTINGS_CHANGE") actionColor = "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
                if (log.action === "DELETE") actionColor = "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";

                return (
                  <tr key={log.id} className="bg-white dark:bg-transparent border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">{log.admin?.name || "کاربر ناشناس"}</span>
                          <span className="text-xs text-gray-400">{log.admin?.email || log.admin?.phoneNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${actionColor}`}>
                        <ActionIcon className="w-3 h-3" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-xs">
                        {log.entity} {log.entityId ? `(#${log.entityId.slice(-6)})` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 truncate" title={log.description}>{log.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span>{log.ipAddress || "نامشخص"}</span>
                        <span className="truncate max-w-[150px]" title={log.userAgent || ""}>
                          {log.userAgent || "نامشخص"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Intl.DateTimeFormat('fa-IR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }).format(new Date(log.createdAt))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    هیچ گزارشی ثبت نشده است.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <span className="text-sm text-gray-500">صفحه {page} از {totalPages}</span>
            <div className="flex gap-2">
              <a
                href={page > 1 ? `/admin/audit-logs?page=${page - 1}` : '#'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${page > 1 ? 'bg-white dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
              >
                قبلی
              </a>
              <a
                href={page < totalPages ? `/admin/audit-logs?page=${page + 1}` : '#'}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${page < totalPages ? 'bg-white dark:bg-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
              >
                بعدی
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
