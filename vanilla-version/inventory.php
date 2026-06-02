<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
$stmt = $conn->prepare("SELECT * FROM products ORDER BY stock ASC");
$stmt->execute();
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Inventory Ledger</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Stock Levels & Product Catalog</p>
        </div>
        <div class="flex gap-3">
            <button onclick="inventory.openModal('add-product-modal')" class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95">
                <i data-lucide="plus" class="w-4 h-4"></i> Add New Product
            </button>
            <button class="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                <i data-lucide="download" class="w-4 h-4"></i> Export CSV
            </button>
        </div>
    </header>

    <div class="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-50 flex items-center gap-4">
            <div class="relative flex-1">
                <i data-lucide="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" placeholder="Search by SKU or Name..." class="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-6 py-3 text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all">
            </div>
            <select class="bg-slate-50 border-none rounded-2xl px-6 py-3 text-xs font-black uppercase text-slate-500 focus:ring-4 focus:ring-emerald-500/10">
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Accessories</option>
            </select>
        </div>

        <table class="w-full text-left">
            <thead class="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                    <th class="px-8 py-5">Product Info</th>
                    <th class="px-6 py-5">SKU</th>
                    <th class="px-6 py-5">Category</th>
                    <th class="px-6 py-5 text-right">Price</th>
                    <th class="px-6 py-5 text-center">Stock Level</th>
                    <th class="px-8 py-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                <?php foreach($products as $p): ?>
                <tr class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">
                                <?php echo substr($p['name'], 0, 1); ?>
                            </div>
                            <div>
                                <p class="text-sm font-black text-slate-800 leading-none"><?php echo $p['name']; ?></p>
                                <p class="text-[10px] text-slate-400 font-bold mt-1"><?php echo $p['unit']; ?></p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-5 text-[11px] font-black text-slate-400 tracking-wider">#<?php echo $p['sku']; ?></td>
                    <td class="px-6 py-5 text-[11px] font-bold text-slate-600"><?php echo $p['category']; ?></td>
                    <td class="px-6 py-5 text-right text-[12px] font-black text-slate-900">₱<?php echo number_format($p['price'], 2); ?></td>
                    <td class="px-6 py-5 text-center">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                            <div class="w-2 h-2 rounded-full <?php echo $p['stock'] < 10 ? 'bg-rose-500' : 'bg-emerald-500'; ?> animate-pulse"></div>
                            <span class="text-[11px] font-black <?php echo $p['stock'] < 10 ? 'text-rose-600' : 'text-emerald-700'; ?>">
                                <?php echo $p['stock']; ?>
                            </span>
                        </div>
                    </td>
                    <td class="px-8 py-5 text-right">
                        <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onclick="inventory.editProduct(<?php echo htmlspecialchars(json_encode($p)); ?>)" class="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit Product">
                                <i data-lucide="edit-3" class="w-4 h-4"></i>
                            </button>
                            <button onclick="inventory.openDamageModal(<?php echo $p['id']; ?>, '<?php echo addslashes($p['name']); ?>')" class="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Report Damage">
                                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                            </button>
                            <button onclick="inventory.confirmDelete(<?php echo $p['id']; ?>)" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Product">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Container -->
<div id="product-modal-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
    
    <!-- Add/Edit Product Modal -->
    <div id="product-modal" class="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden hidden">
        <div class="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 id="modal-title" class="text-xl font-black text-slate-900 tracking-tight">ADD NEW PRODUCT</h3>
            <button onclick="inventory.closeModal()" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <form id="product-form" class="p-8 space-y-6">
            <input type="hidden" id="product-id">
            <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input type="text" id="p-name" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <input type="text" id="p-category" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none">
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (₱)</label>
                    <input type="number" step="0.01" id="p-price" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Stock</label>
                    <input type="number" id="p-stock" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                </div>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barcode / SKU</label>
                <div class="flex gap-3">
                    <input type="text" id="p-barcode" placeholder="Input or Generate" class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black tracking-widest outline-none">
                    <button type="button" onclick="inventory.generateBarcode()" class="px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">GENERATE</button>
                </div>
            </div>

            <button type="submit" class="w-full py-5 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                SAVE TO CATALOGUE <i data-lucide="check" class="w-4 h-4"></i>
            </button>
        </form>
    </div>

    <!-- Damage Report Modal -->
    <div id="damage-modal" class="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden hidden">
        <div class="p-8 bg-amber-50 border-b border-amber-100 flex justify-between items-center text-amber-600">
            <h3 class="text-xl font-black tracking-tight">REPORT DAMAGED ITEM</h3>
            <button onclick="inventory.closeModal()" class="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <form class="p-8 space-y-6">
            <input type="hidden" id="damage-product-id">
            <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Item to Fill Up:</p>
                <p id="damage-item-name" class="text-lg font-black text-slate-900 leading-none">---</p>
            </div>
            
            <div class="space-y-4">
                <div class="space-y-2 text-left">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Damaged Quantity</label>
                    <input type="number" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold">
                </div>
                <div class="space-y-2 text-left">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Condition Description</label>
                    <textarea rows="3" required placeholder="Describe the damage (e.g. Broken seal, expired, defective...)" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none"></textarea>
                </div>
            </div>

            <button type="submit" class="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">SUBMIT DAMAGE LOG</button>
        </form>
    </div>

    <!-- Security Verification Modal (Delete) -->
    <div id="delete-modal" class="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden hidden pt-12 p-8 text-center">
        <div class="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/10">
            <i data-lucide="shield-alert" class="w-10 h-10"></i>
        </div>
        <h3 class="text-xl font-black text-slate-900 mb-2">AUTH REQUIRED</h3>
        <p class="text-xs text-slate-400 font-bold mb-8 uppercase tracking-tighter leading-tight">Deletion requires senior administrative <br> password verification.</p>
        
        <form class="space-y-4">
            <input type="hidden" id="delete-product-id">
            <input type="password" placeholder="Passphrase Entry" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-center tracking-[0.3em] focus:ring-4 focus:ring-rose-500/10 outline-none transition-all">
            <div class="grid grid-cols-2 gap-3 mt-8">
                <button type="button" onclick="inventory.closeModal()" class="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">CANCEL</button>
                <button type="submit" class="py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20">VERIFY & ERASE</button>
            </div>
        </form>
    </div>
</div>
<?php include 'footer.php'; ?>
