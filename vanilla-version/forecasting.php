<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
// Sample data for forecasting
$products = [
    ['name' => 'Wireless Mouse Pro', 'current' => 15, 'forecast' => 45, 'confidence' => 92],
    ['name' => 'Mechanical Keyboard', 'current' => 8, 'forecast' => 12, 'confidence' => 85],
    ['name' => 'USB-C Hub', 'current' => 20, 'forecast' => 18, 'confidence' => 78],
];
?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">AI Inventory Forecasting</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Predictive Analytics powered by Gemini Engine</p>
        </div>
        <button class="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i> Recalculate Model
        </button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 p-8">
                   <div class="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                       <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                       Model Optimized
                   </div>
                </div>
                <h3 class="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Projected Demand (Next 30 Days)</h3>
                <div class="h-64 flex items-end justify-between gap-4 px-4">
                    <!-- Simple CSS bar chart -->
                    <div class="w-full flex-1 bg-slate-100 rounded-t-2xl relative group">
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all">W1: 154u</div>
                        <div class="bg-emerald-500 w-full rounded-t-2xl transition-all" style="height: 45%;"></div>
                    </div>
                    <div class="w-full flex-1 bg-slate-100 rounded-t-2xl relative group">
                        <div class="bg-emerald-500 w-full rounded-t-2xl transition-all" style="height: 65%;"></div>
                    </div>
                    <div class="w-full flex-1 bg-slate-100 rounded-t-2xl relative group">
                        <div class="bg-emerald-500 w-full rounded-t-2xl transition-all" style="height: 85%;"></div>
                    </div>
                    <div class="w-full flex-1 bg-slate-100 rounded-t-2xl relative group">
                        <div class="bg-emerald-400 w-full rounded-t-2xl transition-all" style="height: 55%;"></div>
                    </div>
                </div>
                <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                </div>
            </div>

            <div class="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-50 bg-slate-50/30">
                    <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Suggested Restock Actions</h3>
                </div>
                <div class="divide-y divide-slate-50">
                    <?php foreach($products as $p): ?>
                    <div class="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                <i data-lucide="package" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-black text-slate-800 uppercase"><?php echo $p['name']; ?></h4>
                                <p class="text-[10px] text-slate-400 font-bold">Current Stock: <?php echo $p['current']; ?> Units</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Forecasted Need: +<?php echo $p['forecast']; ?></p>
                            <div class="flex items-center gap-3">
                                <div class="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div class="bg-emerald-500 h-full" style="width: <?php echo $p['confidence']; ?>%"></div>
                                </div>
                                <span class="text-[10px] font-black text-slate-400"><?php echo $p['confidence']; ?>% Match</span>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-emerald-500 text-white p-8 rounded-[40px] shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
                <i data-lucide="sparkles" class="w-32 h-32 absolute -right-8 -bottom-8 opacity-10 rotate-12"></i>
                <h3 class="text-lg font-black uppercase tracking-tight mb-2">Smart Insight</h3>
                <p class="text-xs font-bold leading-relaxed opacity-90 mb-6">Based on historical trends, "Mechanical Keyboards" will likely peak in demand next Tuesday due to seasonal shopping local events. Consider boosting stock today.</p>
                <button class="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Apply Recommendation</button>
            </div>

            <div class="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Algorithm Status</h3>
                <div class="space-y-4">
                    <div class="flex justify-between items-center text-[11px] font-bold text-slate-500">
                        <span>Data Fidelity</span>
                        <span class="text-emerald-500">High (98%)</span>
                    </div>
                    <div class="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full w-[98%]"></div>
                    </div>
                    <div class="pt-4 flex items-center gap-3">
                        <i data-lucide="cpu" class="w-8 h-8 text-slate-200"></i>
                        <p class="text-[9px] text-slate-400 font-bold leading-tight">Gemini Reasoning Engine 1.5-Flash processing store telemetry...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
