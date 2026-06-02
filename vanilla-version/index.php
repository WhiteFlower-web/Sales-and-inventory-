<?php include 'header.php'; ?>
<?php include 'db.php'; ?>

<div class="p-8 overflow-y-auto w-full">
    <!-- AI Insights Header -->
    <div class="mb-10 bg-gradient-to-r from-slate-900 to-slate-800 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div class="relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-white/5">
                <i data-lucide="sparkles" class="w-3 h-3 text-emerald-400"></i> AI Intelligence Active
            </div>
            <h2 class="text-4xl font-black tracking-tight mb-2">Welcome back, Admin.</h2>
            <p class="text-slate-400 text-sm font-bold tracking-tight max-w-xl leading-relaxed">Our AI Forecasting engine has detected a potential 15% increase in demand for <span class="text-emerald-400">Wireless Peripherals</span> this weekend. Would you like to review the automated restock plan?</p>
            <div class="mt-8 flex gap-4">
                <a href="forecasting.php" class="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95">
                    View AI Blueprint <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
                <a href="inventory.php" class="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md">
                    Check Inventory Control
                </a>
            </div>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <i data-lucide="banknote" class="w-5 h-5"></i>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales Today</p>
            <h3 class="text-2xl font-black text-slate-900">₱24,580.00</h3>
            <p class="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                <i data-lucide="trending-up" class="w-3 h-3"></i> +12.5% from yesterday
            </p>
        </div>

        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <div class="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <i data-lucide="shopping-bag" class="w-5 h-5"></i>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</p>
            <h3 class="text-2xl font-black text-slate-900">142</h3>
            <p class="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Average ₱173.10 / basket</p>
        </div>

        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4">
                <i data-lucide="package" class="w-5 h-5"></i>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory Value</p>
            <h3 class="text-2xl font-black text-slate-900">₱1.2M</h3>
            <p class="text-[10px] text-amber-600 font-bold mt-2 uppercase tracking-tighter">8 SKUs below threshold</p>
        </div>

        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <div class="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-4">
                <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel Active</p>
            <h3 class="text-2xl font-black text-slate-900">03</h3>
            <p class="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">Ms. Perlin, Juan, Maria</p>
        </div>
    </div>

    <!-- Recent Activity Placeholder -->
    <div class="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Sales Activity</h3>
            <a href="pos.php" class="text-[9px] font-black text-emerald-500 uppercase hover:underline">Launch POS →</a>
        </div>
        <div class="p-0">
            <table class="w-full text-left">
                <thead class="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                        <th class="px-8 py-4">Transaction ID</th>
                        <th class="px-6 py-4">Items</th>
                        <th class="px-6 py-4">Total Amount</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-8 py-4 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody class="text-[11px] font-bold text-slate-600 divide-y divide-slate-50">
                    <tr class="hover:bg-slate-50/30 transition-colors">
                        <td class="px-8 py-4 text-slate-900">TX-88219</td>
                        <td class="px-6 py-4">Wireless Mouse Pro...</td>
                        <td class="px-6 py-4 font-black text-slate-900">₱49.99</td>
                        <td class="px-6 py-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] uppercase">Punched</span></td>
                        <td class="px-8 py-4 text-right opacity-60">1:02 PM</td>
                    </tr>
                    <tr class="hover:bg-slate-50/30 transition-colors">
                        <td class="px-8 py-4 text-slate-900">TX-88218</td>
                        <td class="px-6 py-4">Mechanical Keyboard</td>
                        <td class="px-6 py-4 font-black text-slate-900">₱129.99</td>
                        <td class="px-6 py-4"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] uppercase">Punched</span></td>
                        <td class="px-8 py-4 text-right opacity-60">12:45 PM</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
