<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JJ Judejush Stores | POS System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-50 font-sans h-screen overflow-hidden">
    <div class="flex h-full">
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-20">
            <div class="mb-10 flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/20">JJ</div>
                <div>
                    <h1 class="text-sm font-black tracking-tight leading-none">JUDEJUSH</h1>
                    <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">POS System</p>
                </div>
            </div>

            <nav class="space-y-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <?php 
                session_start();
                $user_role = $_SESSION['role'] ?? 'Admin'; // Default to Admin for demo
                $current_page = basename($_SERVER['PHP_SELF']); 

                // Navigation Configuration (Matching React Logic)
                $nav_items = [
                    ['id' => 'index.php', 'label' => 'Dashboard', 'icon' => 'layout-dashboard', 'roles' => ['Admin', 'Sales Staff', 'Inventory Staff']],
                    ['id' => 'pos.php', 'label' => 'Sales Terminal / POS', 'icon' => 'shopping-cart', 'roles' => ['Admin', 'Sales Staff']],
                    ['id' => 'inventory.php', 'label' => 'Inventory Control', 'icon' => 'package', 'roles' => ['Admin', 'Inventory Staff', 'Sales Staff']],
                    ['id' => 'stock_history.php', 'label' => 'Stock History', 'icon' => 'history', 'roles' => ['Admin', 'Inventory Staff']],
                    ['id' => 'forecasting.php', 'label' => 'AI Forecasting', 'icon' => 'brain-circuit', 'roles' => ['Admin']],
                    ['id' => 'reports.php', 'label' => 'Reports', 'icon' => 'bar-chart-3', 'roles' => ['Admin']],
                    ['id' => 'audit_logs.php', 'label' => 'Audit Logs', 'icon' => 'file-text', 'roles' => ['Admin']],
                    ['id' => 'accounts.php', 'label' => 'Manage Accounts', 'icon' => 'users', 'roles' => ['Admin']],
                    ['id' => 'settings.php', 'label' => 'Settings', 'icon' => 'settings', 'roles' => ['Admin', 'Inventory Staff']],
                ];

                foreach ($nav_items as $item) {
                    if (in_array($user_role, $item['roles'])) {
                        $active = ($item['id'] == $current_page) ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5';
                        echo "<a href='{$item['id']}' class='flex items-center gap-3 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all $active'>
                            <i data-lucide='{$item['icon']}' class='w-4 h-4'></i> {$item['label']}
                        </a>";
                    }
                }
                ?>
            </nav>

            <div class="pt-6 border-t border-slate-800">
                <div class="flex items-center gap-3 p-2 bg-white/5 rounded-2xl">
                    <div class="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-slate-300">A</div>
                    <div class="text-[10px]">
                        <p class="font-black">Admin User</p>
                        <p class="text-slate-500 font-bold uppercase tracking-tighter">Terminal 01</p>
                    </div>
                    <a href="#" class="ml-auto text-slate-500 hover:text-rose-500 transition-colors">
                        <i data-lucide="log-out" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col overflow-hidden">
