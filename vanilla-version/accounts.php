<?php include 'header.php'; ?>
<?php 
include 'db.php'; 
// Sample account data
$users = [
    ['name' => 'System Admin', 'email' => 'admin@judejush.com', 'role' => 'admin', 'status' => 'online'],
    ['name' => 'Ms. Perlin', 'email' => 'perlin@judejush.com', 'role' => 'staff', 'status' => 'offline'],
    ['name' => 'Juan Dela Cruz', 'email' => 'juan@judejush.com', 'role' => 'manager', 'status' => 'offline'],
];
?>

<div class="p-8 overflow-y-auto w-full">
    <header class="flex justify-between items-end mb-10">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Access Control</h2>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Staff Accounts & Terminal Permissions</p>
        </div>
        <button onclick="inventory.openUserModal()" class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
            <i data-lucide="user-plus" class="w-4 h-4"></i> Provision New User
        </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <?php foreach($users as $user): ?>
        <div class="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:translate-y-[-4px] transition-all group">
            <div class="flex justify-between items-start mb-6">
                <div class="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                    <?php echo substr($user['name'], 0, 1); ?>
                </div>
                <span class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest <?php echo $user['status'] == 'online' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'; ?>">
                    <?php echo $user['status']; ?>
                </span>
            </div>
            <h3 class="text-lg font-black text-slate-900 leading-none"><?php echo $user['name']; ?></h3>
            <p class="text-[11px] text-slate-400 font-bold mt-2 lowercase"><?php echo $user['email']; ?></p>
            
            <div class="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                   <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Level</p>
                   <p class="text-[11px] font-black text-slate-900 uppercase mt-1"><?php echo $user['role']; ?></p>
                </div>
                <div class="flex gap-2">
                    <button onclick="inventory.editUser(<?php echo htmlspecialchars(json_encode($user)); ?>)" class="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-xl transition-all"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><i data-lucide="key" class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Add/Edit User Modal -->
<div id="user-modal-backdrop" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] hidden items-center justify-center p-4">
    <div class="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
        <form id="user-form">
            <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div class="text-left">
                    <h3 id="user-modal-title" class="text-xl font-black text-slate-800 tracking-tight uppercase">PROVISION NEW USER</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Create encrypted terminal credentials</p>
                </div>
                <button type="button" onclick="inventory.closeUserModal()" class="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div class="p-8 space-y-6 text-left">
                <input type="hidden" id="staff-id">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Staff Name</label>
                  <input type="text" id="staff-name" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all">
                </div>
                
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Corporate Email (Login ID)</label>
                  <input type="email" id="staff-email" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-amber-500/10 outline-none">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Authority</label>
                    <select id="staff-role" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black uppercase outline-none">
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Sales Staff">Sales Terminal Staff</option>
                      <option value="Inventory Staff">Inventory Control</option>
                    </select>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Terminal Password</label>
                    <input type="password" id="staff-pass" required class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none">
                  </div>
                </div>
            </div>

            <div class="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button type="button" onclick="inventory.closeUserModal()" class="flex-1 py-5 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Cancel</button>
                <button type="submit" class="flex-2 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    Register Account
                </button>
            </div>
        </form>
    </div>
</div>

<?php include 'footer.php'; ?>
