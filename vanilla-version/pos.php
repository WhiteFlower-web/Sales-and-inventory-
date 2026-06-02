<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
$stmt = $conn->prepare("SELECT * FROM products");
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="flex h-full w-full">
    <!-- POS Main Side -->
    <div class="flex-1 flex flex-col p-8 overflow-hidden bg-slate-50">
        <header class="flex justify-between items-end mb-8">
            <div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Active Terminal</h2>
                <div class="flex items-center gap-2 mt-1">
                    <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Main Store Front | Online</p>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="relative group">
                    <i data-lucide="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                    <input id="product-search" type="text" placeholder="Scan or search..." class="bg-white border border-slate-200 rounded-2xl pl-11 pr-6 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-72 shadow-sm transition-all">
                </div>
            </div>
        </header>

        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-8" id="product-grid">
            <?php foreach($products as $p): ?>
            <div onclick="pos.addToCart(<?php echo htmlspecialchars(json_encode($p)); ?>)" 
                 class="bg-white p-6 rounded-[28px] border border-slate-200 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group cursor-pointer active:scale-95">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                    <span><?php echo $p['category']; ?></span>
                    <span class="<?php echo $p['stock'] < 10 ? 'text-rose-500' : 'text-emerald-500'; ?> bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100"><?php echo $p['stock']; ?> IN STOCK</span>
                </div>
                <h3 class="text-sm font-black text-slate-800 leading-tight mb-4 group-hover:text-emerald-600 transition-colors min-h-[2.5rem]"><?php echo $p['name']; ?></h3>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-black text-slate-900 leading-none">₱<?php echo number_format($p['price'], 2); ?></span>
                    <div class="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-90 transition-all">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>

    <!-- Right Checkout Sidebar -->
    <div class="w-96 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10 relative">
        <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Order</h3>
            <button onclick="pos.clearCart()" class="text-slate-300 hover:text-rose-500 transition-colors">
                <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
        </div>

        <div id="cart-container" class="flex-1 overflow-y-auto p-6 space-y-3">
            <!-- Dynamic Cart Items -->
            <div class="flex flex-col items-center justify-center h-full opacity-20 text-center grayscale">
                <i data-lucide="shopping-bag" class="w-16 h-16 mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Scanning terminal active... Add products to punch sale</p>
            </div>
        </div>

        <div class="p-8 bg-white border-t border-slate-100 space-y-6">
            <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                <div class="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span>Subtotal</span>
                    <span id="cart-subtotal">₱0.00</span>
                </div>
                <div class="flex justify-between text-2xl font-black text-slate-900">
                    <span>Total</span>
                    <span id="cart-total" class="tracking-tighter">₱0.00</span>
                </div>
            </div>

            <button onclick="pos.processSale()" id="sale-btn" class="w-full py-5 bg-emerald-500 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:grayscale" disabled>
                PROCESS SALE <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>
    </div>
</div>

<!-- Receipt Popup -->
<div id="receipt-modal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] hidden items-center justify-center p-4">
    <div class="bg-white w-full max-w-sm rounded-[40px] shadow-3xl overflow-hidden p-10 text-center space-y-8 animate-in zoom-in duration-300">
        <div class="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <i data-lucide="check-circle-2" class="w-10 h-10"></i>
        </div>
        <div>
            <h3 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Sale Punched Successfully</h3>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Order #JJ-88219</p>
        </div>
        
        <div class="py-6 border-y border-dashed border-slate-200">
            <p class="text-4xl font-black text-slate-900 tracking-tighter" id="final-total">₱0.00</p>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Cash Tendered: ₱500.00</p>
        </div>

        <div class="flex gap-4">
             <button onclick="window.location.reload()" class="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Next Sale</button>
             <button onclick="pos.printThermalReceipt()" class="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-all" title="Print Thermal Receipt">
                <i data-lucide="printer" class="w-5 h-5"></i>
             </button>
        </div>
    </div>
</div>

<?php include 'footer.php'; ?>
