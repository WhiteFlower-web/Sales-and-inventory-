<?php include 'header.php'; ?>

<div class="p-8 overflow-y-auto w-full h-full bg-slate-50">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Hardware, Backup & Terminal Preferences</p>
        </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        <!-- Hardware Settings -->
        <div class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <i data-lucide="cpu" class="w-4 h-4 text-emerald-500"></i> Peripheral Integration
            </h3>
            
            <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-3">
                        <i data-lucide="scan-barcode" class="w-6 h-6 text-slate-400"></i>
                        <div>
                            <p class="text-[11px] font-black text-slate-800 uppercase">Barcode Scanner</p>
                            <p class="text-[9px] text-emerald-500 font-bold tracking-tighter">HID-Mode Connector: ONLINE</p>
                        </div>
                    </div>
                    <div class="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center">
                        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-3">
                        <i data-lucide="printer" class="w-6 h-6 text-slate-400"></i>
                        <div>
                            <p class="text-[11px] font-black text-slate-800 uppercase">Thermal Receipt Printer</p>
                            <p class="text-[9px] text-slate-400 font-bold tracking-tighter">POS-58 Series (USB-64)</p>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[8px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all">Test Print</button>
                </div>
            </div>
        </div>

        <!-- Backup Settings -->
        <div class="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 p-8">
                <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <i data-lucide="cloud-lightning" class="w-6 h-6 text-emerald-400"></i>
                </div>
            </div>
            <h3 class="text-xs font-black uppercase tracking-widest mb-8 opacity-60">Backup & Storage Vault</h3>
            
            <div class="space-y-6">
                <div>
                   <div class="flex justify-between text-[11px] font-black uppercase mb-2">
                       <span>Database Usage</span>
                       <span class="text-emerald-400">12.4 MB / 1 GB</span>
                   </div>
                   <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                       <div class="bg-emerald-500 h-full w-[2%]"></div>
                   </div>
                </div>

                <div class="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
                    <div class="flex justify-between items-center text-[10px] font-bold">
                        <span class="opacity-60 uppercase">Last Backup:</span>
                        <span>Today, 03:00 AM</span>
                    </div>
                    <button class="w-full py-4 bg-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Force Cloud Sync</button>
                    <button class="w-full py-4 bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Download Local Backup</button>
                </div>
            </div>
        </div>

        <!-- App Preferences -->
        <div class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6 md:col-span-2">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Global Terminal Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="space-y-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency Locale</p>
                   <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10">
                       <option>PHP (₱) - Philippine Peso</option>
                       <option>USD ($) - US Dollar</option>
                   </select>
                </div>
                <div class="space-y-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Header</p>
                   <input type="text" value="JJ JUDEJUSH STORES" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold">
                </div>
                <div class="space-y-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Logout</p>
                   <select class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold">
                       <option>After 30 Mins Inactive</option>
                       <option>After 1 Hour Inactive</option>
                       <option>Never</option>
                   </select>
                </div>
            </div>
            <div class="flex justify-end pt-4">
                <button class="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Save System Config</button>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
