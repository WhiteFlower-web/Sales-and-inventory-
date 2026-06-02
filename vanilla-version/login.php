<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | JJ Judejush Stores</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-900 flex items-center justify-center h-screen relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -top-20 -left-20 animate-pulse"></div>
    <div class="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -bottom-20 -right-20"></div>

    <div class="w-full max-w-md p-8 glass rounded-[40px] shadow-2xl relative z-10 border border-white/20">
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-3xl mx-auto mb-4 shadow-xl shadow-emerald-500/30">JJ</div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">TERMINAL ACCESS</h1>
            <p class="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">JJ Judejush Stores Security</p>
        </div>

        <form id="login-form" class="space-y-4">
            <div id="step-1" class="space-y-4">
                <div class="relative">
                    <i data-lucide="mail" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="email" id="email" placeholder="Staff Email Address" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all">
                </div>
                <button type="button" onclick="sendOTP()" class="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                    SEND SECURITY CODE <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </div>

            <div id="step-2" class="space-y-4 hidden">
                <div class="relative">
                    <i data-lucide="key-round" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="password" id="password" placeholder="Account Password" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none">
                </div>
                <div class="relative">
                    <i data-lucide="shield-check" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="otp" placeholder="6-Digit OTP" class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-black tracking-[0.5em] text-center outline-none">
                </div>
                <button type="submit" class="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
                    AUTHORIZE LOGIN
                </button>
            </div>
        </form>

        <div class="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">OR SCAN TO LOG IN</p>
            <div class="p-4 bg-white border border-slate-200 rounded-[32px] shadow-inner">
                <div id="qr-reader" class="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-slate-200 transition-all group">
                    <i data-lucide="qr-code" class="w-12 h-12 text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
                    <div class="absolute inset-0 border-2 border-emerald-500 opacity-20 animate-pulse"></div>
                    <div class="absolute bottom-2 inset-x-0 text-[7px] font-black uppercase text-slate-400 text-center opacity-0 group-hover:opacity-100">Click to Scan</div>
                </div>
            </div>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Terminal QR Identity Recognition Active</p>
        </div>
    </div>

    <script>
        lucide.createIcons();
        
        async function sendOTP() {
            const email = document.getElementById('email').value;
            if(!email) return alert('Enter email');
            
            // Simulation: In real PHP, call auth_api.php
            document.getElementById('step-1').classList.add('hidden');
            document.getElementById('step-2').classList.remove('hidden');
            alert('OTP Sent (Simulator: 123456)');
        }

        document.getElementById('login-form').onsubmit = (e) => {
            e.preventDefault();
            // In real app, redirect to index.php
            window.location.href = 'index.php';
        };
    </script>
</body>
</html>
