<?php include 'header.php'; ?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">System Alerts</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Notifications & Store Updates</p>
        </div>
        <button class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Mark all as read</button>
    </header>

    <div class="max-w-4xl space-y-4">
        <!-- Alert Card -->
        <div class="bg-white p-6 rounded-[32px] border-l-4 border-l-rose-500 border border-slate-200 shadow-sm flex gap-6 items-start">
            <div class="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                <i data-lucide="alert-triangle" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-sm font-black text-slate-900 uppercase">Critical Low Stock Warning</h3>
                    <span class="text-[9px] font-black text-slate-400 uppercase">10 mins ago</span>
                </div>
                <p class="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">Product <span class="text-slate-900">"Mechanical Keyboard"</span> has dropped below the safety threshold (5 units remaining). Automatic reorder recommended.</p>
                <div class="flex gap-3 mt-4">
                    <button class="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800">Resolve Now</button>
                    <button class="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100">Dismiss</button>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-[32px] border-l-4 border-l-emerald-500 border border-slate-200 shadow-sm flex gap-6 items-start">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                <i data-lucide="check-circle" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-sm font-black text-slate-900 uppercase">Shift Backup Successful</h3>
                    <span class="text-[9px] font-black text-slate-400 uppercase">2 hours ago</span>
                </div>
                <p class="text-[11px] text-slate-500 font-bold mt-2 leading-relaxed">Daily transaction backup for <span class="text-slate-900">05/11/2026</span> has been encrypted and stored in the secure cloud vault.</p>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-[32px] border-l-4 border-l-blue-500 border border-slate-200 shadow-sm opacity-60 flex gap-6 items-start">
            <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                <i data-lucide="info" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <h3 class="text-sm font-black text-slate-900 uppercase">System Login Detected</h3>
                    <span class="text-[9px] font-black text-slate-400 uppercase">07:25 AM</span>
                </div>
                <p class="text-[11px] text-slate-500 font-bold mt-2">New login session initiated from <span class="text-slate-900">Terminal-01</span> by Admin.</p>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
