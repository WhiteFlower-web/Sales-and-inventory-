<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
// Sample audit logs
$logs = [
    ['user' => 'Admin User', 'action' => 'LOGIN', 'detail' => 'Session started from Terminal 01', 'time' => '07:25 AM', 'ip' => '192.168.1.10'],
    ['user' => 'Ms. Perlin', 'action' => 'SALE', 'detail' => 'OR #TX-88219 (₱49.99)', 'time' => '01:02 PM', 'ip' => '192.168.1.11'],
    ['user' => 'Admin User', 'action' => 'USER_CREATE', 'detail' => 'New staff "Juan Dela Cruz" added', 'time' => '10:15 AM', 'ip' => '192.168.1.10'],
    ['user' => 'Juan Dela Cruz', 'action' => 'VOID_SALE', 'detail' => 'OR #TX-88102 Reverted by Manager', 'time' => '02:30 PM', 'ip' => '192.168.1.12'],
];
?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">System Audit logs</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Immutable Ledger of Administrative Actions</p>
        </div>
        <div class="flex gap-2">
            <button class="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <i data-lucide="archive" class="w-4 h-4"></i> Backup Log Archive
            </button>
        </div>
    </header>

    <div class="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <div class="relative flex-1">
                <i data-lucide="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" placeholder="Filter by user or action..." class="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-6 py-3 text-xs font-bold shadow-sm">
            </div>
            <button class="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors">
                <i data-lucide="filter" class="w-4 h-4"></i>
            </button>
        </div>

        <table class="w-full text-left">
            <thead class="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                    <th class="px-8 py-5">Timestamp</th>
                    <th class="px-6 py-5">Personnel</th>
                    <th class="px-6 py-5">Event Type</th>
                    <th class="px-6 py-5">Description</th>
                    <th class="px-8 py-5 text-right">Node/IP</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                <?php foreach($logs as $l): ?>
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-8 py-5 text-[11px] font-bold text-slate-400"><?php echo $l['time']; ?></td>
                    <td class="px-6 py-5">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[8px] uppercase"><?php echo substr($l['user'], 0, 1); ?></div>
                            <span class="text-xs font-black text-slate-800"><?php echo $l['user']; ?></span>
                        </div>
                    </td>
                    <td class="px-6 py-5">
                        <span class="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter <?php echo $l['action'] == 'VOID_SALE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'; ?>">
                            <?php echo $l['action']; ?>
                        </span>
                    </td>
                    <td class="px-6 py-5 text-[11px] font-bold text-slate-500 italic"><?php echo $l['detail']; ?></td>
                    <td class="px-8 py-5 text-right font-mono text-[9px] text-slate-400"><?php echo $l['ip']; ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include 'footer.php'; ?>
