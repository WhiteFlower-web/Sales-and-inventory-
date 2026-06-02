<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
// Sample Stock History Data
$history = [
    ['item' => 'Wireless Mouse Pro', 'qty' => '+50', 'type' => 'Restock', 'staff' => 'Admin User', 'time' => '1 hour ago'],
    ['item' => 'Mechanical Keyboard', 'qty' => '-1', 'type' => 'Sale', 'staff' => 'Ms. Perlin', 'time' => '10 mins ago'],
    ['item' => '7-Port USB-C Hub', 'qty' => '-5', 'type' => 'Adjustment', 'staff' => 'Admin User', 'time' => 'Yesterday'],
];
?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Stock Movements</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline of Inventory Adjustments & Restocks</p>
        </div>
    </header>

    <div class="space-y-4">
        <?php foreach($history as $h): ?>
        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6 hover:translate-x-2 transition-all">
            <div class="w-12 h-12 flex items-center justify-center rounded-2xl <?php echo $h['qty'][0] == '+' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'; ?>">
                <i data-lucide="<?php echo $h['qty'][0] == '+' ? 'package-plus' : 'package-minus'; ?>" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <h3 class="text-sm font-black text-slate-900 uppercase"><?php echo $h['item']; ?></h3>
                <p class="text-[10px] text-slate-400 font-bold mt-1">Action: <span class="text-slate-900"><?php echo $h['type']; ?></span> • By <?php echo $h['staff']; ?></p>
            </div>
            <div class="text-right">
                <p class="text-lg font-black <?php echo $h['qty'][0] == '+' ? 'text-emerald-500' : 'text-rose-500'; ?>"><?php echo $h['qty']; ?></p>
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest"><?php echo $h['time']; ?></p>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<?php include 'footer.php'; ?>
