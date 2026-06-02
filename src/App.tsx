import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BrainCircuit, 
  ShieldCheck, 
  Users, 
  Search, 
  Bell, 
  Printer, 
  Wifi, 
  WifiOff,
  Scan, 
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  History,
  LogOut,
  Settings,
  MoreVertical,
  Activity,
  Cpu,
  Lock,
  User as UserIcon,
  CheckCircle2,
  PackageSearch,
  Store,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type UserRole = 'Admin' | 'Sales Staff' | 'Inventory Staff';
type Branch = 'Store 1' | 'Store 2';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  lastAudit: string;
  status: 'active' | 'damaged' | 'lost';
  isSeasonalPeak?: boolean;
}

interface StockHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  changeType: 'Entry' | 'Sale' | 'Damaged' | 'Edit' | 'Delete';
  delta: number;
  finalStock: number;
  user: string;
  timestamp: string;
  reason?: string;
}

interface CartItem extends InventoryItem {
  cartQuantity: number;
}

interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  sales: number;
  lastLogin: string;
  status?: 'online' | 'offline';
  lastActive?: string;
  password?: string;
}

interface AuditEntry {
  id: string;
  user: string;
  role: UserRole;
  action: 'Login' | 'Logout' | 'Update' | 'Delete' | 'Add' | 'Edit' | 'Void';
  details: string;
  timestamp: string;
}

interface ReceiptSettings {
  showLogo: boolean;
  storeName: string;
  address: string;
  contact: string;
  fontSize: 'small' | 'medium' | 'large';
  includeQR: boolean;
  footerMessage: string;
  autoPrint: boolean;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface ActivityLog {
  id: string;
  type: 'sale' | 'audit' | 'inventory' | 'system';
  message: string;
  timestamp: string;
  statusColor: string;
}

interface SalesData {
  time: string;
  actual: number;
  forecast?: number;
}

// --- Mock Data ---
const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Wireless Mouse Pro', sku: 'SKU-882', barcode: '690123456789', price: 49.99, cost: 25.00, stock: 12, category: 'Peripherals', lastAudit: '2024-05-01', status: 'active', isSeasonalPeak: true },
  { id: '2', name: 'Mechanical Keyboard RGB', sku: 'SKU-104', barcode: '690123456780', price: 129.99, cost: 70.00, stock: 8, category: 'Peripherals', lastAudit: '2024-05-02', status: 'active' },
  { id: '3', name: '4K Monitor 27"', sku: 'SKU-990', barcode: '690123456781', price: 349.99, cost: 200.00, stock: 5, category: 'Display', lastAudit: '2024-04-28', status: 'active' },
  { id: '4', name: 'USB-C Hub 10-in-1', sku: 'SKU-441', barcode: '690123456782', price: 59.99, cost: 30.00, stock: 45, category: 'Accessories', lastAudit: '2024-05-01', status: 'active' },
  { id: '5', name: 'Webcam High Definition', sku: 'SKU-312', barcode: '690123456783', price: 89.99, cost: 45.00, stock: 2, category: 'Video', lastAudit: '2024-05-03', status: 'active', isSeasonalPeak: true },
];

const MOCK_SALES_HISTORY: SalesData[] = [
  { time: '08:00', actual: 420 },
  { time: '10:00', actual: 850 },
  { time: '12:00', actual: 1200 },
  { time: '14:00', actual: 980 },
  { time: '16:00', actual: 1100 },
  { time: '18:00', actual: 1450, forecast: 1500 },
  { time: '20:00', actual: 1200, forecast: 1350 },
  { time: '22:00', actual: 800, forecast: 950 },
];

const INITIAL_ACTIVITY: ActivityLog[] = [
  { id: '1', type: 'sale', message: 'Sale Completed | Receipt #40283 | ₱84.99', timestamp: 'Just Now', statusColor: 'bg-emerald-500' },
  { id: '2', type: 'system', message: 'Printer Check | Thermal head cleaned. Calibration successful.', timestamp: '2m ago', statusColor: 'bg-blue-500' },
  { id: '3', type: 'audit', message: 'Audit Discrepancy | SKU-990 Flagged for physical count.', timestamp: '14m ago', statusColor: 'bg-amber-500' },
  { id: '4', type: 'inventory', message: 'Full system backup completed to secure cloud vault.', timestamp: '45m ago', statusColor: 'bg-slate-300' },
];

const MOCK_USERS: AppUser[] = [
  { id: '1', name: 'Ms. Perlin', role: 'Admin', email: 'perlin@judejush.com', sales: 125400, lastLogin: 'Active', status: 'online', lastActive: 'Now', password: 'password123' },
  { id: '2', name: 'Juan Dela Cruz', role: 'Sales Staff', email: 'juan@judejush.com', sales: 45200, lastLogin: '1h ago', status: 'offline', lastActive: '1h ago', password: 'password123' },
  { id: '3', name: 'Maria Santos', role: 'Inventory Staff', email: 'maria@judejush.com', sales: 0, lastLogin: '4h ago', status: 'offline', lastActive: '4h ago', password: 'password123' },
];

/**
 * Main Application Component
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials' | 'otp' | 'reset-password' | 'qr'>('credentials');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    showLogo: true,
    storeName: 'JJ JUDEJUSH STORES',
    address: 'Caloocan, Sabalo Kapak Palengke',
    contact: '09XX-XXX-XXXX',
    fontSize: 'small',
    includeQR: true,
    footerMessage: 'Thank you for shopping at JudeJush!',
    autoPrint: true
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sales' | 'forecast' | 'reports' | 'audit' | 'users' | 'settings' | 'history'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [activeBranch, setActiveBranch] = useState<Branch>('Store 1');
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>(INITIAL_ACTIVITY);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  
  // Audit Helper
  const logActivity = (action: AuditEntry['action'], details: string) => {
    const activeUserName = users.find(u => u.email === loginEmail)?.name || 'System';
    const activeUserRole = userRole;
    
    const newEntry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      user: activeUserName,
      role: activeUserRole,
      action,
      details,
      timestamp: new Date().toLocaleString(),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };
  
  // Reports State
  const [reportType, setReportType] = useState<'inventory' | 'transaction' | 'sales'>('inventory');
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransactionTotal, setLastTransactionTotal] = useState(0);
  const [lastTransactionItems, setLastTransactionItems] = useState<CartItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isPrinterOnline, setIsPrinterOnline] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // CRUD Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    sku: '',
    barcode: '',
    email: '',
    role: 'Sales Staff' as UserRole,
    password: ''
  });

  const onlineCount = useMemo(() => users.filter(u => u.status === 'online').length, [users]);
  const offlineCount = useMemo(() => users.filter(u => u.status === 'offline').length, [users]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AppUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      password: formData.password,
      status: 'offline',
      lastActive: 'Never',
      sales: 0,
      lastLogin: 'Never'
    };
    setUsers(prev => [...prev, newUser]);
    setIsUserModalOpen(false);
    resetForm();
    addNotification('Staff Management', `New account created for ${newUser.name}.`, 'success');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? {
      ...u,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      password: formData.password || u.password
    } : u));
    setIsUserModalOpen(false);
    resetForm();
    addNotification('Staff Management', 'User credentials updated successfully.', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    if (userRole !== 'Admin') {
      addNotification('Permission Denied', 'Only Administrators can deactivate accounts.', 'error');
      return;
    }

    const userToRemove = users.find(u => u.id === userId);
    if (userToRemove) {
      logActivity('Delete', `Credential Purge: Terminated access for ${userToRemove.name}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      addNotification('Security Update', 'User account permanently deactivated.', 'warning');
    }
  };

  // Initialize Gemini
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  /**
   * Authentication Logic
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    if (user) {
      setLoginStep('otp');
      addNotification('Security Protocol', 'OTP has been sent to your registered device.', 'info');
    } else {
      addNotification('Login Failed', 'Invalid credentials. Please try again.', 'error');
    }
  };

  const verifyOtp = () => {
    if (otpCode === '1234') { // Mock OTP
      setIsLoggedIn(true);
      const user = users.find(u => u.email === loginEmail);
      if (user) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'online', lastActive: 'Now' } : u));
        logActivity('Login', `Terminal session established for ${user.name}`);
      }
      addNotification('Welcome Back', `Logged in successfully as ${userRole}.`, 'success');
    } else {
      addNotification('Security Error', 'Invalid OTP code. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    const user = users.find(u => u.email === loginEmail);
    if (user) {
      logActivity('Logout', `System session terminated by ${user.name}`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'offline', lastActive: new Date().toLocaleString() } : u));
    }
    setIsLoggedIn(false);
    setLoginStep('credentials');
    setOtpCode('');
  };

  const handleResetPassword = () => {
    setLoginStep('reset-password');
  };

  const submitNewPassword = () => {
    if (newPassword.length >= 6) {
      addNotification('System Sync', 'Password updated successfully.', 'success');
      setLoginStep('credentials');
      setNewPassword('');
    } else {
      addNotification('Entry Error', 'Password must be at least 6 characters.', 'error');
    }
  };

  /**
   * Helper to add notifications
   */
  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNote: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNote, ...prev].slice(0, 5));
    if (type === 'warning' || type === 'error') setIsNotificationsOpen(true);
  };

  /**
   * Simulate low stock notifications
   */
  /**
   * Inventory Logic
   */
  const logStockHistory = (entry: Omit<StockHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: StockHistoryEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setStockHistory(prev => [newEntry, ...prev]);
  };

  const generateBarcode = () => {
    return '690' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      sku: formData.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
      barcode: formData.barcode || generateBarcode(),
      lastAudit: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setInventory(prev => [...prev, newItem]);
    logActivity('Add', `Stock Induction: Registered ${newItem.name} with ${newItem.stock} units`);
    logStockHistory({
      productId: newItem.id,
      productName: newItem.name,
      changeType: 'Entry',
      delta: newItem.stock,
      finalStock: newItem.stock,
      user: 'Ms. Perlin'
    });
    setIsAddModalOpen(false);
    resetForm();
    addNotification('Inventory Update', `${newItem.name} added to system.`, 'success');
  };

  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setInventory(prev => prev.map(item => {
      if (item.id === selectedItem.id) {
        const updated = {
          ...item,
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock),
          sku: formData.sku,
          barcode: formData.barcode
        };
        
        logActivity('Update', `Refined Product: ${updated.name} | Final Stock: ${updated.stock}`);
        if (updated.stock !== item.stock) {
          logStockHistory({
            productId: item.id,
            productName: updated.name,
            changeType: 'Edit',
            delta: updated.stock - item.stock,
            finalStock: updated.stock,
            user: 'Ms. Perlin'
          });
        }
        return updated;
      }
      return item;
    }));
    
    setIsEditModalOpen(false);
    resetForm();
    addNotification('Inventory Update', `${formData.name} information updated.`, 'success');
  };

  const handleDeleteProduct = () => {
    if (deletePassword !== 'admin123') { // Mock admin password
      addNotification('Security Error', 'Invalid Admin Password. Access Denied.', 'error');
      return;
    }
    if (selectedItem) {
      logActivity('Delete', `Security Purge: Removed product profile for ${selectedItem.name}`);
      setInventory(prev => prev.filter(i => i.id !== selectedItem.id));
      logStockHistory({
        productId: selectedItem.id,
        productName: selectedItem.name,
        changeType: 'Delete',
        delta: -selectedItem.stock,
        finalStock: 0,
        user: 'Ms. Perlin'
      });
      setIsDeleteModalOpen(false);
      setDeletePassword('');
      addNotification('System Security', `Product ${selectedItem.name} permanently deleted.`, 'warning');
    }
  };

  const reportDamagedWithHistory = (item: InventoryItem) => {
    setInventory(prev => prev.map(inv => {
      if (inv.id === item.id) {
        logStockHistory({
          productId: item.id,
          productName: item.name,
          changeType: 'Damaged',
          delta: -1,
          finalStock: inv.stock - 1,
          user: 'Ms. Perlin'
        });
        return {...inv, stock: inv.stock - 1, status: inv.stock - 1 === 0 ? 'damaged' : inv.status};
      }
      return inv;
    }));
    addNotification('Item Reported', `${item.name} marked as DAMAGED. Stock adjusted.`, 'error');
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: '', cost: '', stock: '', sku: '', barcode: '' });
    setSelectedItem(null);
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      cost: item.cost.toString(),
      stock: item.stock.toString(),
      sku: item.sku,
      barcode: item.barcode
    });
    setIsEditModalOpen(true);
  };

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
  }, [inventory]);

  /**
   * POS Logic
   */
  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      addNotification('Stock Error', `${item.name} is out of stock.`, 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.cartQuantity + delta);
        return { ...i, cartQuantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const cartTax = 0; // Tax-free or included in JJ JudeJush for now

  const handleCheckout = () => {
    const cash = parseFloat(cashReceived);
    if (isNaN(cash) || cash < cartTotal) {
      addNotification('Payment Error', 'Insufficient cash amount.', 'error');
      return;
    }

    logActivity('Update', `Sale Executed | Total: ₱${cartTotal.toFixed(2)} | Items: ${cart.length}`);

    // Deduct stock
    setInventory(prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      if (cartItem) {
        const finalStock = p.stock - cartItem.cartQuantity;
        logStockHistory({
          productId: p.id,
          productName: p.name,
          changeType: 'Sale',
          delta: -cartItem.cartQuantity,
          finalStock: finalStock,
          user: 'Ms. Perlin'
        });
        return { ...p, stock: finalStock };
      }
      return p;
    }));

    setLastTransactionTotal(cartTotal);
    setLastTransactionItems([...cart]);
    setShowReceipt(true);
    addNotification('Sale Success', 'Transaction completed and stock updated.', 'success');
    
    // Log Activity
    const log: ActivityLog = {
      id: Math.random().toString(),
      type: 'sale',
      message: `POS Sale | Total: ₱${cartTotal.toFixed(2)} | Cash: ₱${cash.toFixed(2)}`,
      timestamp: 'Just Now',
      statusColor: 'bg-emerald-500'
    };
    setActivity(prev => [log, ...prev]);

    setCart([]);
    setCashReceived('');
  };

  const voidTransaction = () => {
    if (cart.length === 0) return;
    
    logActivity('Void', `Transaction Aborted by ${userRole}`);
    if (userRole === 'Sales Staff') {
      addNotification('Security Alert', `Void action recorded by Sales Terminal. Admin notified.`, 'warning');
    }
    setCart([]);
    setCashReceived('');
    addNotification('Terminal Reset', 'Current transaction has been voided.', 'info');
  };

  useEffect(() => {
    const lowStock = inventory.filter(i => i.stock < 5);
    if (lowStock.length > 0) {
      addNotification('Low Stock Alert', `${lowStock.length} items are running low on stock in ${activeBranch}.`, 'warning');
    }
  }, [inventory, activeBranch]);

  /**
   * AI Forecasting simulation using Gemini
   */
  const handleAIForecast = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setAiAnalysis("AI features requires a Gemini API Key. Please set it in secrets.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `Analyze this inventory data and provide a brief (1-2 sentence) sales forecast and optimization recommendation: ${JSON.stringify(inventory)}` }]
          }
        ],
        config: {
          systemInstruction: "You are a retail inventory AI specialist. Provide extremely concise, high-density professional insights."
        }
      });
      setAiAnalysis(response.text || "Unable to generate forecast at this time.");
    } catch (error) {
      console.error("AI Forecast Error:", error);
      setAiAnalysis("Error generating AI projection. Using local trend heuristics.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Nav Items Configuration with Role-Based filtering
   */
  const navItems = useMemo(() => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Sales Staff', 'Inventory Staff'] },
      { id: 'inventory', label: 'Inventory Control', icon: Package, roles: ['Admin', 'Inventory Staff', 'Sales Staff'] },
      { id: 'history', label: 'Stock History', icon: History, roles: ['Admin', 'Inventory Staff'] },
      { id: 'sales', label: 'Sales Terminal', icon: ShoppingCart, roles: ['Admin', 'Sales Staff'] },
      { id: 'forecast', label: 'AI Forecasting', icon: BrainCircuit, roles: ['Admin'] },
      { id: 'reports', label: 'Reports', icon: FileText, roles: ['Admin'] },
      { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, roles: ['Admin'] },
      { id: 'users', label: 'Manage Accounts', icon: Users, roles: ['Admin'] },
      { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Inventory Staff'] },
    ];
    return items.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>

        <div className="w-full max-w-md z-10">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-900 font-black text-2xl mx-auto mb-4 shadow-xl shadow-amber-500/20">
              JJ
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">JJ JudeJush Stores</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Management Portal v2.0</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              {loginStep === 'credentials' && (
                <motion.form 
                  key="creds"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input 
                        type="email" 
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                      <button type="button" onClick={handleResetPassword} className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input 
                        type="password" 
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      Authenticate
                    </button>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Entry</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setLoginStep('qr')}
                      className="w-full py-3.5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Scan className="w-4 h-4 text-emerald-400" />
                      Scan QR Terminal Access
                    </button>
                  </motion.form>
                )}

                {loginStep === 'qr' && (
                  <motion.div 
                    key="qr"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-full aspect-square bg-white rounded-3xl p-6 shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 border-2 border-emerald-500/30 animate-pulse pointer-events-none"></div>
                      {/* Fake QR Scanner Visual */}
                      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center relative">
                        <div className="w-48 h-48 border-4 border-slate-900 border-dashed rounded-lg opacity-10"></div>
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_2s_infinite]"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <h2 className="text-xl font-black text-white uppercase tracking-tight">QR Authentication</h2>
                       <p className="text-slate-400 text-xs font-bold leading-relaxed">Position your system QR badge within the scanner frame.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setLoginStep('credentials')} 
                        className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancel QR Access
                      </button>
                      
                      {/* Auto-login simulation for demo */}
                      <button 
                        onClick={() => {
                          setLoginEmail('perlin@judejush.com');
                          setUserRole('Admin');
                          setIsLoggedIn(true);
                          addNotification('QR Entry', 'Terminal access granted via secure QR handshake.', 'success');
                          logActivity('Login', 'Terminal session established via QR badge: Admin');
                        }}
                        className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                      >
                        [Simulate Successful Scan]
                      </button>
                    </div>
                  </motion.div>
                )}

              {loginStep === 'otp' && (
                <motion.div 
                  key="otp"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verify Identity</h2>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed">Enter the 4-digit security code sent to your device. (Try: 1234)</p>
                  </div>

                  <input 
                    type="text" 
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-4xl font-black text-amber-500 text-center tracking-[0.5em] focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="0000"
                    autoFocus
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-4">
                      <button onClick={() => setLoginStep('credentials')} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10">Back</button>
                      <button onClick={verifyOtp} className="flex-[2] py-3 bg-amber-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400">Verify</button>
                    </div>
                    <button 
                      onClick={() => setLoginStep('reset-password')}
                      className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                    >
                      Security Compromised? Reset Password
                    </button>
                  </div>
                </motion.div>
              )}

              {loginStep === 'reset-password' && (
                <motion.div 
                  key="reset"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Set New Password</h2>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed">System administrator credential override protocol.</p>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New System Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setLoginStep('credentials')} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10">Cancel</button>
                    <button onClick={submitNewPassword} className="flex-[2] py-3 bg-amber-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-400">Apply New Password</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <p className="mt-8 text-center text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
            Secured by JJ-SHIELD Security Engine
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* --- Left Sidebar --- */}
      <aside className="w-64 bg-slate-900 flex flex-col text-slate-300 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 text-center">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-amber-500/20 pulse-amber">JJ</div>
            <div className="flex flex-col items-start">
              <span className="text-[13px] leading-none font-black text-white tracking-tighter uppercase whitespace-nowrap">JJ JudeJush Stores</span>
              <span className="text-[9px] leading-normal font-bold text-slate-500 uppercase tracking-widest">Management System</span>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              activeBranch === 'Store 1' ? "text-amber-500" : "text-blue-500"
            )}>{activeBranch}</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-500 uppercase">Active</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer",
                activeTab === item.id 
                  ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" 
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-slate-900" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <div className="text-xs font-bold text-slate-100 truncate">Kherleen Mae</div>
              <div className="text-[10px] text-amber-500 truncate uppercase tracking-widest font-black">{userRole}</div>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quick Role Switcher (Demo Purposes) */}
          <div className="px-3 py-2 space-y-1">
            <div className="flex gap-1">
              {(['Admin', 'Sales Staff', 'Inventory Staff'] as UserRole[]).map(role => (
                <button 
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={cn(
                    "flex-1 text-[8px] font-black uppercase py-1 rounded transition-all",
                    userRole === role ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {role.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* --- Receipt Modal --- */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">Confirm SKU Purge</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed mb-8">
                    You are about to permanently delete <span className="text-slate-900 font-black">{selectedItem?.name}</span>. 
                    This action is <span className="text-rose-600">irreversible</span>. 
                    Please enter the Admin Security Password to proceed.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Admin Password Required</label>
                      <input 
                        type="password" 
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20"
                        placeholder="••••••••"
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }}
                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleDeleteProduct}
                        className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all cursor-pointer"
                      >
                        Purge Record
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showReceipt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 text-center bg-emerald-500 text-white">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-black uppercase tracking-widest">Sale Successful</h3>
                  <p className="text-xs font-bold opacity-80">Transaction #JJ-{Math.floor(Math.random()*100000)}</p>
                </div>
                <div className={cn(
                  "p-8 space-y-6 text-left transition-all",
                  receiptSettings.fontSize === 'small' ? 'scale-90 origin-top' : receiptSettings.fontSize === 'large' ? 'scale-105 origin-top' : ''
                )}>
                  <div className="space-y-1 text-center border-b border-dashed border-slate-200 pb-4">
                    {receiptSettings.showLogo && (
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black mx-auto mb-2 text-sm shadow-lg">JJ</div>
                    )}
                    <h4 className="font-black text-slate-800 uppercase text-sm">{receiptSettings.storeName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter leading-tight whitespace-pre-wrap">
                      {receiptSettings.address}
                      <br />
                      {receiptSettings.contact}
                    </p>
                    <div className="px-2 py-0.5 bg-slate-100 rounded inline-block text-[8px] font-black uppercase tracking-wider text-slate-500 mt-2 border border-slate-200">
                      Terminal Output: {activeBranch}
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-b border-dashed border-slate-100 pb-4">
                     {lastTransactionItems.map(item => (
                       <div key={item.id} className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-600 truncate mr-4">{item.cartQuantity}x {item.name}</span>
                          <span className="text-slate-800 shrink-0">₱{(item.price * item.cartQuantity).toFixed(2)}</span>
                       </div>
                     ))}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Subtotal</span>
                      <span className="font-black text-slate-800">₱{lastTransactionTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black pt-2 border-t border-slate-100 mt-2">
                      <span className="text-slate-900 uppercase tracking-tighter">Amount Due</span>
                      <span className="text-emerald-600 tracking-tighter">₱{lastTransactionTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 pt-2">
                    {receiptSettings.includeQR && (
                       <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                          <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
                             <Scan className="w-8 h-8 text-white opacity-20" />
                          </div>
                          <p className="text-[7px] font-black text-center mt-1 text-slate-400">TX-AUDIT-QR</p>
                       </div>
                    )}
                    <p className="text-[9px] font-black text-slate-400 text-center italic leading-tight">
                      {receiptSettings.footerMessage}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      setShowReceipt(false);
                      setIsPrinterOnline(true);
                      addNotification('Thermal Printer', 'Receipt generated successfully.', 'success');
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
                  >
                    Close & Print Receipt
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {(isAddModalOpen || isEditModalOpen) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
              >
                <form onSubmit={isAddModalOpen ? handleAddProduct : handleEditProduct}>
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="text-left">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                        {isAddModalOpen ? 'Add New Product' : 'Edit Product Details'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {isAddModalOpen ? 'Initialize new SKU into decentralized ledger' : `Modifying ${selectedItem?.sku}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-8 grid grid-cols-2 gap-6 text-left">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="e.g. Wireless Mouse Pro"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        <option value="">Select Category</option>
                        <option value="Peripherals">Peripherals</option>
                        <option value="Display">Display</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Initial Stock</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Selling Price (₱)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unit Cost (₱)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Barcode</label>
                        <button type="button" onClick={() => setFormData({...formData, barcode: generateBarcode()})} className="text-[9px] font-black text-amber-600 uppercase">Auto-Generate</button>
                      </div>
                      <input 
                        type="text" 
                        value={formData.barcode}
                        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Scan or input barcode"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-2 py-4 bg-amber-500 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                      {isAddModalOpen ? 'Commit to System' : 'Update Ledger'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {isUserModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
              >
                <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}>
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="text-left">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                        {selectedUser ? 'Manage Staff Access' : 'Register New Personnel'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {selectedUser ? `Modifying authentication for ${selectedUser.name}` : 'Create encrypted terminal credentials'}
                      </p>
                    </div>
                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-6 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="e.g. Ms. Perlin"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address (Login ID)</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="staff@judejush.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Access Role</label>
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                        >
                          <option value="Admin">Green Label (Admin)</option>
                          <option value="Sales Staff">Blue Label (Sales Staff)</option>
                          <option value="Inventory Staff">Blue Label (Inventory Staff)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Terminal Password</label>
                        <input 
                          required={!selectedUser}
                          type="password" 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                          placeholder={selectedUser ? "Leave blank to keep current" : "••••••••"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                      {selectedUser ? 'Commit Changes' : 'Create Access Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Top Header --- */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-6 flex-1">
            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['Store 1', 'Store 2'] as Branch[]).map(branch => (
                <button
                  key={branch}
                  onClick={() => setActiveBranch(branch)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activeBranch === branch 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {branch}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="relative group">
              <input 
                type="text" 
                placeholder="Product SKU or Global Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-amber-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 mr-6">
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                  <div className={cn("w-2 h-2 rounded-full", isPrinterOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}></div>
                  THERMAL READY
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 text-[11px] font-bold">
                  <Wifi className="w-3.5 h-3.5" />
                  BRANCH SYNC
                </div>
              </div>

            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl relative transition-all"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              )}
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
              <Settings className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black tracking-tight border border-emerald-100 shadow-sm flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                ₱{totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </header>

        {/* --- Notification Panel --- */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-16 right-6 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Notifications</h3>
                  <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-slate-200 rounded text-slate-400"><X className="w-4 h-4" /></button>
               </div>
               <div className="max-h-[400px] overflow-y-auto">
                 {notifications.length === 0 ? (
                   <div className="p-12 text-center text-slate-300 text-xs font-bold">No new notifications</div>
                 ) : (
                   notifications.map(note => (
                     <div key={note.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
                        <div className="flex items-center gap-2 mb-1">
                          {note.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          {note.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          <span className="font-bold text-xs text-slate-800">{note.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{note.message}</p>
                     </div>
                   ))
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Content View --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* --- Top Stats Grid --- */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Today's Sales", value: '₱8,450.00', trend: '↑ 12% vs kahapon', color: 'text-emerald-600', icon: TrendingUp, roles: ['Admin', 'Sales Staff'] },
                    { label: 'Total Sales', value: '₱345,280.00', trend: 'Monthly Performance', color: 'text-slate-800', icon: DollarSign, roles: ['Admin'] },
                    { label: 'Low Stock Alert', value: inventory.filter(i => i.stock < 5).length.toString(), trend: 'Requires Attention', color: 'text-rose-600', icon: AlertTriangle, roles: ['Admin', 'Inventory Staff'] },
                    { label: 'Live Terminals', value: '2/2 Active', trend: 'Printer Status: Ready', color: 'text-blue-600', icon: Printer, roles: ['Admin', 'Sales Staff'] },
                  ].filter(s => s.roles.includes(userRole)).map((stat, i) => (
                    <div key={i} className="bg-white p-6 border border-slate-200 rounded-[28px] shadow-sm hover:shadow-md transition-all text-left relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                             <stat.icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</div>
                        <div className="text-slate-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- Main Dashboard Content --- */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Sales Velocity Chart */}
                  <div className="col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Sales Data Performance</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time throughput analysis</p>
                       </div>
                       <div className="flex gap-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                             <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Actual</span>
                          </div>
                       </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_SALES_HISTORY}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', fill: '#94a3b8' }} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="actual" stroke="#f59e0b" fill="#fef3c7" fillOpacity={0.4} strokeWidth={4} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Products / Movers */}
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left flex flex-col">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase mb-6">Top Performers</h3>
                    <div className="flex-1 space-y-6">
                       {inventory.slice(0, 4).map((item, idx) => (
                         <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-300 text-xs group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">#{idx + 1}</div>
                               <div>
                                  <p className="text-xs font-black text-slate-800">{item.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase">{item.sku}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-slate-800">₱{item.price.toFixed(0)}</p>
                               <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-1 rounded tracking-tighter">Hot Item</span>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Full Inventory Report</button>
                  </div>
                </div>

                {/* --- Recent Activity Feed --- */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden text-left">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900">
                           <Activity className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase">System Pulse Log</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time terminal event stream</p>
                        </div>
                     </div>
                     <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors">Audit History</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5 text-left">Timestamp</th>
                          <th className="px-6 py-5 text-left">Category</th>
                          <th className="px-6 py-5 text-left">Event Detail</th>
                          <th className="px-6 py-5 text-left">Origin</th>
                          <th className="px-8 py-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-50">
                        {activity.map((log, i) => (
                          <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-5 text-slate-400 font-medium">{log.timestamp}</td>
                            <td className="px-6 py-5">
                               <span className={cn(
                                 "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                                 log.type === 'sale' ? "bg-emerald-100 text-emerald-600" : 
                                 log.type === 'system' ? "bg-blue-100 text-blue-600" :
                                 log.type === 'audit' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                               )}>{log.type}</span>
                            </td>
                            <td className="px-6 py-5 text-slate-800 max-w-xs truncate">{log.message}</td>
                            <td className="px-6 py-5 text-slate-400 uppercase tracking-widest text-[9px]">Terminal-01</td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end items-center gap-2">
                                  <div className={cn("w-1.5 h-1.5 rounded-full", log.statusColor)}></div>
                                  <span className="uppercase text-[9px] font-black opacity-60">Verified</span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* --- Report Filters --- */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-end gap-4 text-left">
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Report Type</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                         <option value="inventory">Inventory Report</option>
                         <option value="transaction">Transaction Report</option>
                         <option value="sales">Sales (Staff) Report</option>
                      </select>
                   </div>
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Start Date</label>
                      <input 
                        type="date" 
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                   </div>
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">End Date</label>
                      <input 
                        type="date" 
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                         Apply Filter
                      </button>
                      <button className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                         <FileText className="w-3.5 h-3.5" /> Download PDF
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                   <div className="col-span-3 space-y-6">
                      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden text-left">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                           <div>
                              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                                 {reportType === 'inventory' && 'Universal Stock Audit'}
                                 {reportType === 'transaction' && 'Electronic Transaction Ledger'}
                                 {reportType === 'sales' && 'Personnel Performance Analytics'}
                              </h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                 {reportType === 'inventory' && `Current Records Found: ${inventory.length}`}
                                 {reportType === 'transaction' && `Total Transactions Period: ${INITIAL_ACTIVITY.filter(a => a.type === 'sale').length}`}
                                 {reportType === 'sales' && `System Activity Count: 8 Active Events`}
                              </p>
                           </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                           <table className="w-full">
                              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                 <tr>
                                    {reportType === 'inventory' && (
                                       <>
                                          <th className="px-8 py-5 text-left">Product Detail</th>
                                          <th className="px-6 py-5 text-left">Category</th>
                                          <th className="px-6 py-5 text-center">Stock Count</th>
                                          <th className="px-6 py-5 text-right">Unit Price</th>
                                          <th className="px-8 py-5 text-right">Valuation</th>
                                       </>
                                    )}
                                    {reportType === 'transaction' && (
                                       <>
                                          <th className="px-8 py-5 text-left">ID No. (Receipt)</th>
                                          <th className="px-6 py-5 text-left">Customer / Trace</th>
                                          <th className="px-6 py-5 text-left">Timestamp</th>
                                          <th className="px-6 py-5 text-right">Total Amount</th>
                                          <th className="px-8 py-5 text-right">Action</th>
                                       </>
                                    )}
                                    {reportType === 'sales' && (
                                       <>
                                          <th className="px-8 py-5 text-left">Staff Member</th>
                                          <th className="px-6 py-5 text-left">Action Type</th>
                                          <th className="px-6 py-5 text-left">Event Details</th>
                                          <th className="px-6 py-5 text-right">Value (₱)</th>
                                          <th className="px-8 py-5 text-right">Handled At</th>
                                       </>
                                    )}
                                 </tr>
                              </thead>
                              <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-50">
                                 {reportType === 'inventory' && inventory.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                       <td className="px-8 py-5">
                                          <div className="font-black text-slate-800">{item.name}</div>
                                          <div className="text-[9px] text-slate-400 uppercase tracking-widest">{item.sku}</div>
                                       </td>
                                       <td className="px-6 py-5 uppercase text-[10px]">{item.category}</td>
                                       <td className="px-6 py-5 text-center">
                                          <span className={cn(
                                             "px-2 py-0.5 rounded-lg font-black",
                                             item.stock < 5 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                          )}>{item.stock}</span>
                                       </td>
                                       <td className="px-6 py-5 text-right">₱{item.price.toFixed(2)}</td>
                                       <td className="px-8 py-5 text-right font-black text-slate-800">₱{(item.price * item.stock).toLocaleString()}</td>
                                    </tr>
                                 ))}
                                 
                                 {reportType === 'transaction' && INITIAL_ACTIVITY.filter(a => a.type === 'sale').map((tx, i) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                                       <td className="px-8 py-5 text-slate-800">RCP-00{i+1}</td>
                                       <td className="px-6 py-5 text-slate-400 uppercase tracking-widest">Standard Customer</td>
                                       <td className="px-6 py-5 opacity-60">{tx.timestamp}</td>
                                       <td className="px-6 py-5 text-right font-black text-slate-900">{tx.message.split(' | ')[2]}</td>
                                       <td className="px-8 py-5 text-right">
                                          <button 
                                                onClick={() => setSelectedTransaction(tx)}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all group cursor-pointer"
                                                title="View Action"
                                              >
                                                 <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                              </button>
                                       </td>
                                    </tr>
                                 ))}

                                 {reportType === 'sales' && (
                                    <>
                                       {[
                                          { staff: 'Ms. Perlin', type: 'Sales Transaction', detail: 'ORD #88219 - Mouse Pro', amount: '49.99', time: '1:02 PM' },
                                          { staff: 'Juan Staff', type: 'System Login', detail: 'Terminal 02 Activated', amount: '0.00', time: '12:55 PM' },
                                          { staff: 'Ms. Perlin', type: 'Sales Transaction', detail: 'ORD #88220 - Keyboard', amount: '129.99', time: '12:45 PM' },
                                          { staff: 'Maria Sarah', type: 'System Action', detail: 'Stock Audit SKU-104', amount: '0.00', time: '12:30 PM' },
                                       ].map((log, i) => (
                                          <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                             <td className="px-8 py-5 flex items-center gap-2">
                                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-[8px] font-black">
                                                   {log.staff.split(' ')[1]?.[0] || 'S'}
                                                </div>
                                                <span className="text-slate-800">{log.staff}</span>
                                             </td>
                                             <td className="px-6 py-5">
                                                <span className={cn(
                                                   "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter",
                                                   log.type === 'Sales Transaction' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                                )}>{log.type}</span>
                                             </td>
                                             <td className="px-6 py-5 text-slate-400">{log.detail}</td>
                                             <td className="px-6 py-5 text-right font-black">₱{log.amount}</td>
                                             <td className="px-8 py-5 text-right opacity-60">{log.time}</td>
                                              <td className="px-8 py-5 text-right">
                                                 {log.type === 'Sales Transaction' && (
                                                    <button 
                                                      onClick={() => setSelectedTransaction({
                                                        id: `ORD-${Math.floor(Math.random()*100000)}`,
                                                        timestamp: `05/08/2026 ${log.time}`,
                                                        message: `Sale | ${log.staff} | ₱${log.amount}`,
                                                        staff: log.staff,
                                                        items: log.amount === '49.99' ? [{name: 'Wireless Mouse Pro', qty: 1, price: 49.99}] : [{name: 'Mechanical Keyboard RGB', qty: 1, price: 129.99}],
                                                        cash: parseFloat(log.amount) + 5,
                                                        change: 5
                                                      })}
                                                      className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all group cursor-pointer"
                                                      title="View Receipt"
                                                    >
                                                       <Scan className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                 )}
                                              </td>
                                           </tr>
                                       ))}
                                    </>
                                 )}
                              </tbody>
                           </table>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6 text-left">
                       {/* Receipt Preview Pane */}
                       <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Archive</h3>
                             {selectedTransaction && (
                               <button 
                                 onClick={() => console.log('Voiding...')}
                                 className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                               >
                                 <AlertTriangle className="w-3 h-3" /> Void OR
                               </button>
                             )}
                          </div>
                          <div className="flex-1 p-6 flex flex-col items-center relative">
                             {selectedTransaction ? (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-inner text-center space-y-4 relative overflow-hidden"
                                >
                                   <div className={cn(
                                     "space-y-1 transition-all",
                                     receiptSettings.fontSize === 'small' ? 'scale-90 origin-top' : receiptSettings.fontSize === 'large' ? 'scale-105 origin-top' : ''
                                   )}>
                                      {receiptSettings.showLogo && (
                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black mx-auto mb-2 text-[10px] shadow-lg">JJ</div>
                                      )}
                                      <h4 className="text-sm font-black text-slate-800 uppercase leading-none">{receiptSettings.storeName}</h4>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-tight whitespace-pre-wrap mb-1">
                                        {receiptSettings.address}
                                      </p>
                                      <div className="h-px bg-slate-200 w-full mb-2 border-b border-dashed"></div>
                                      
                                      <div className="flex justify-between text-[9px] font-black text-slate-800 mb-1">
                                         <span>OR No: {selectedTransaction.id}</span>
                                         <span>{selectedTransaction.timestamp}</span>
                                      </div>
                                      <div className="text-left text-[9px] font-bold text-slate-500 uppercase mb-4">
                                         Cashier: {selectedTransaction.staff || 'Ms. Perlin'}
                                      </div>
                                   </div>

                                   <div className="py-2 border-y border-dashed border-slate-200 text-left space-y-2">
                                      <div className="grid grid-cols-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                         <div className="col-span-2">Item</div>
                                         <div className="text-center">Qty</div>
                                         <div className="text-right">Price</div>
                                      </div>
                                      {selectedTransaction.items ? (
                                        selectedTransaction.items.map((item, idx) => (
                                          <div key={idx} className="grid grid-cols-4 text-[10px] font-bold text-slate-800">
                                             <div className="col-span-2 truncate">{item.name}</div>
                                             <div className="text-center">x{item.qty}</div>
                                             <div className="text-right">₱{item.price.toFixed(2)}</div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-[10px] font-bold text-slate-800 italic">Pre-recorded transaction entry</div>
                                      )}
                                   </div>

                                   <div className="pt-2 text-left space-y-1">
                                      <div className="flex justify-between text-xs font-black text-slate-900 border-t border-slate-100 pt-2">
                                         <span>TOTAL:</span>
                                         <span>{selectedTransaction.message.split(' | ')[2]}</span>
                                      </div>
                                      {selectedTransaction.cash && (
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                           <span>CASH:</span>
                                           <span>₱{selectedTransaction.cash.toFixed(2)}</span>
                                        </div>
                                      )}
                                      {selectedTransaction.change !== undefined && (
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                           <span>CHANGE:</span>
                                           <span>₱{selectedTransaction.change.toFixed(2)}</span>
                                        </div>
                                      )}
                                   </div>

                                   <div className="space-y-3 pt-4">
                                      {receiptSettings.includeQR && (
                                        <div className="p-3 bg-white rounded-xl shadow-sm inline-block mx-auto border border-slate-100">
                                           <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center">
                                              <Scan className="w-6 h-6 text-white opacity-20" />
                                           </div>
                                        </div>
                                      )}
                                      <p className="text-[8px] font-black text-slate-400 text-center italic leading-tight px-4 opacity-60">
                                        {receiptSettings.footerMessage}
                                      </p>
                                   </div>

                                   <div className="flex gap-2 mt-6">
                                      <button 
                                        onClick={() => console.log('Reprinting...')}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-slate-900/10 active:scale-95 transition-all cursor-pointer"
                                      >
                                         <Printer className="w-3 h-3" /> Reprint Copy
                                      </button>
                                      <button 
                                        onClick={() => setSelectedTransaction(null)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                                      >
                                         Release View
                                      </button>
                                   </div>
                                </motion.div>
                             ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-20 grayscale">
                                   <div className="relative mb-4">
                                      <FileText className="w-16 h-16" />
                                      <Scan className="w-8 h-8 absolute -bottom-1 -right-1 text-slate-900" />
                                   </div>
                                   <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Select a transaction from the ledger to view the digital receipt archive</p>
                                </div>
                             )}
                          </div>
                       </div>
                      
                      {/* Counter Badge Card */}
                      <div className="bg-amber-500 rounded-[32px] p-6 text-slate-900 text-center shadow-xl shadow-amber-500/20">
                         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Active Staff Reach</h4>
                         <div className="text-4xl font-black tracking-tighter mb-1">82%</div>
                         <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">System performance is optimal for current volume</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="text-left flex items-center gap-4">
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-800">Inventory Control</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Product Library & Labeling</p>
                    </div>
                    {inventory.filter(i => i.stock < 5).length > 0 && (
                      <div className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-full flex items-center gap-2 animate-bounce">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] font-black text-rose-600 uppercase uppercase">{inventory.filter(i => i.stock < 5).length} Items Need Attention</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedItems.length > 0 && (
                      <button 
                        onClick={() => {
                          addNotification('Printer Active', `Generating ${selectedItems.length} barcode labels...`, 'success');
                          setSelectedItems([]);
                        }}
                        className="px-4 py-2 bg-amber-500 text-slate-900 text-xs font-black rounded-lg hover:bg-amber-400 transition-colors uppercase tracking-widest flex items-center gap-2"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Labels ({selectedItems.length})
                      </button>
                    )}
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-widest"
                    >
                      + Add New SKU
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) setSelectedItems(inventory.map(i => i.id));
                              else setSelectedItems([]);
                            }}
                          />
                        </th>
                        <th className="px-6 py-3">Product Item</th>
                        <th className="px-6 py-3">SKU ID</th>
                        <th className="px-6 py-3 text-center">In Stock</th>
                        <th className="px-6 py-3">Unit Price</th>
                        <th className="px-6 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {inventory.map((item) => (
                        <tr key={item.id} className={cn("border-b border-slate-50 hover:bg-slate-50/50 transition-colors", selectedItems.includes(item.id) && "bg-amber-50/30")}>
                          <td className="px-6 py-4">
                            <input 
                              type="checkbox" 
                              checked={selectedItems.includes(item.id)}
                              onChange={() => {
                                setSelectedItems(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              {item.name}
                              {item.isSeasonalPeak && (
                                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter animate-pulse">Peak Demand</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">{item.category}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono">{item.sku}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center">
                              <span className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter mb-1",
                                item.stock === 0 ? "bg-rose-500 text-white" :
                                item.stock < 5 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                              )}>
                                {item.stock === 0 ? 'Out of Stock' : item.stock < 5 ? 'Low Stock' : 'Healthy'}
                              </span>
                              <div className="font-black text-slate-800">{item.stock}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-800 font-black">₱{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                                  <button 
                                      disabled={item.status === 'damaged' || item.stock <= 0}
                                      onClick={() => reportDamagedWithHistory(item)}
                                      className="p-1 px-2 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded text-[9px] font-black uppercase transition-colors disabled:opacity-30"
                                  >
                                      Report Damaged
                                  </button>
                                  <button 
                                      onClick={() => openEditModal(item)}
                                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                      <Settings className="w-4 h-4 text-blue-500" />
                                  </button>
                                  <button 
                                      onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}
                                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                      <Trash2 className="w-4 h-4 text-rose-500" />
                                  </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-left"
              >
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="text-left">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Stock Movement Log</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit-ready physical count history</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Export History
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4 text-left">Timestamp</th>
                        <th className="px-6 py-4 text-left">Product</th>
                        <th className="px-6 py-4 text-left">Operation</th>
                        <th className="px-6 py-4 text-center">Delta</th>
                        <th className="px-6 py-4 text-center">Final Stock</th>
                        <th className="px-6 py-4 text-left">Handled By</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-slate-600 divide-y divide-slate-50">
                      {stockHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-8 py-20 text-center text-slate-300">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="text-base font-black text-slate-200 uppercase tracking-widest">No stock movements recorded yet</p>
                          </td>
                        </tr>
                      ) : (
                        stockHistory.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-slate-400">{entry.timestamp}</td>
                            <td className="px-6 py-5 text-slate-800">{entry.productName}</td>
                            <td className="px-6 py-5 uppercase tracking-tighter">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-black",
                                entry.changeType === 'Sale' ? "bg-emerald-100 text-emerald-600" :
                                entry.changeType === 'Damaged' ? "bg-rose-100 text-rose-600" :
                                entry.changeType === 'Entry' ? "bg-blue-100 text-blue-600" :
                                "bg-slate-100 text-slate-500"
                              )}>
                                {entry.changeType}
                              </span>
                            </td>
                            <td className={cn(
                              "px-6 py-5 text-center font-black",
                              entry.delta > 0 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {entry.delta > 0 ? '+' : ''}{entry.delta}
                            </td>
                            <td className="px-6 py-5 text-center font-black text-slate-800">{entry.finalStock}</td>
                            <td className="px-6 py-5 text-slate-400 font-medium">{entry.user}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'forecast' && (
              <motion.div 
                key="forecast"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="bg-slate-900 rounded-3xl p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl -z-0"></div>
                  <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                      <BrainCircuit className="w-12 h-12 text-slate-900" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Predictive Pro</h2>
                      <p className="text-slate-400 max-w-sm text-sm font-bold uppercase tracking-widest">Smart Stock replenishment & Demand forecasting</p>
                    </div>
                    
                    <button 
                      onClick={handleAIForecast}
                      disabled={isAnalyzing}
                      className="px-10 py-4 bg-amber-500 text-slate-900 font-black rounded-2xl hover:bg-amber-400 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-amber-500/20 cursor-pointer uppercase tracking-widest text-xs"
                    >
                      {isAnalyzing ? <Activity className="w-5 h-5 animate-spin" /> : <Cpu className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                      Start Restock Analysis
                    </button>

                    {aiAnalysis && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-8 bg-slate-800/50 border border-slate-700 rounded-3xl text-left font-bold text-xs leading-relaxed text-amber-200"
                      >
                        <div className="flex items-center gap-2 mb-4 text-amber-500 font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-5 h-5" /> Analysis Generated for {activeBranch}
                        </div>
                        <div className="markdown-body">
                          {aiAnalysis}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-12">
                   <div className="bg-white p-8 rounded-3xl border border-slate-200 text-left hover:shadow-lg transition-shadow">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Local Risk Markers</h4>
                      <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-rose-50 rounded-xl"><AlertTriangle className="w-5 h-5 text-rose-500" /></div>
                          <div>
                            <div className="text-xs font-black text-slate-800">Caloocan Logistics Pulse</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 leading-normal tracking-wide">High congestion at Sabalo market delivery zone. Expect 4h delay.</div>
                          </div>
                        </div>
                      </div>
                   </div>
                   <div className="bg-white p-8 rounded-3xl border border-slate-200 text-left hover:shadow-lg transition-shadow">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Restock Opportunities</h4>
                      <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-50 rounded-xl"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
                          <div>
                            <div className="text-xs font-black text-slate-800">Weekend Surge Prediction</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 leading-normal tracking-wide">Peripherals intent up 18% in Sapalo area. Increase SKU-882 stock.</div>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}



            {activeTab === 'sales' && (
              <motion.div 
                key="sales"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-6"
              >
                <div className="col-span-2 space-y-6">
                  {/* Search and Selection Area */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-black tracking-tight text-slate-800">Sales Terminal</h2>
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                        <Scan className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Scanner Active
                      </div>
                    </div>
                    
                    <div className="relative mb-6">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search product name or scan barcode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[400px] p-1">
                      {inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                        <button 
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className={cn(
                            "p-4 bg-white border border-slate-100 rounded-xl text-left hover:border-amber-400 hover:bg-amber-50/30 transition-all group relative overflow-hidden",
                            item.stock <= 0 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="font-black text-slate-800 text-xs mb-1 truncate">{item.name}</div>
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-amber-600">₱{item.price.toFixed(2)}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded capitalize">{item.category}</span>
                          </div>
                          {item.stock < 5 && item.stock > 0 && <div className="absolute top-0 right-0 p-1 bg-rose-500 text-white text-[8px] font-black">LOW</div>}
                          {item.stock <= 0 && <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center font-black text-[10px] text-rose-500 uppercase">Out of Stock</div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cart Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Active Basket</h3>
                      <button onClick={() => setCart([])} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase">Clear Cart</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {cart.length === 0 ? (
                        <div className="p-12 text-center text-slate-300">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-bold">Basket is empty</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <tbody className="divide-y divide-slate-50">
                            {cart.map(item => (
                              <tr key={item.id}>
                                <td className="p-4">
                                  <div className="text-xs font-black text-slate-800">{item.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3 justify-center">
                                    <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors pointer-events-auto cursor-pointer">-</button>
                                    <span className="text-xs font-black w-4 text-center">{item.cartQuantity}</span>
                                    <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors pointer-events-auto cursor-pointer">+</button>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="text-xs font-black text-slate-800">₱{(item.price * item.cartQuantity).toFixed(2)}</div>
                                </td>
                                <td className="p-4 text-right">
                                  <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-all pointer-events-auto cursor-pointer"><X className="w-3.5 h-3.5"/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full"></div>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Checkout Summary</h3>
                      <div className="space-y-4 border-b border-slate-800 pb-8 mb-8">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 font-bold">Subtotal</span>
                          <span className="font-black">₱{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <span className="text-amber-500 font-black uppercase">Payment</span>
                          <span className="font-black uppercase flex items-center gap-2"><DollarSign className="w-3 h-3"/> CASH ONLY</span>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cash Received</label>
                           <input 
                              type="text" 
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              placeholder="₱0.00"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-black text-white focus:ring-2 focus:ring-amber-500/50 outline-none placeholder:text-slate-600"
                           />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-3xl font-black tracking-tighter mb-8">
                        <span className="text-slate-400 uppercase text-xs mt-3">Total Due</span>
                        <span className="text-amber-500">₱{cartTotal.toFixed(2)}</span>
                      </div>

                      {parseFloat(cashReceived) >= cartTotal && cartTotal > 0 && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                           <span className="text-xs font-bold text-emerald-400 uppercase">Change Due</span>
                           <span className="text-xl font-black text-emerald-400">₱{(parseFloat(cashReceived) - cartTotal).toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button 
                          disabled={cart.length === 0}
                          onClick={voidTransaction}
                          className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all cursor-pointer"
                        >
                          Void Sale
                        </button>
                        <button 
                          disabled={cart.length === 0 || parseFloat(cashReceived) < cartTotal}
                          onClick={handleCheckout}
                          className="flex-[2] py-5 bg-amber-500 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          Complete Sale
                        </button>
                      </div>
                   </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Receipt Draft</span>
                          </div>
                          <div className="px-2 py-0.5 bg-slate-100 rounded text-[7px] font-black text-slate-500 uppercase">Preview</div>
                       </div>
                       
                       <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 scale-[0.95] origin-top border-dashed">
                          <div className="space-y-1 text-center scale-75 origin-top mb-1">
                             <h4 className="text-[10px] font-black text-slate-800 uppercase leading-none">{receiptSettings.storeName}</h4>
                             <p className="text-[6px] font-bold text-slate-400 uppercase leading-none">{receiptSettings.address}</p>
                          </div>
                          <div className="space-y-1 mt-2 mb-2 pb-2 border-b border-slate-200">
                             {cart.length === 0 ? (
                               <div className="text-center py-2 opacity-30 text-[8px] font-black uppercase">Scanning Items...</div>
                             ) : (
                               cart.map(item => (
                                 <div key={item.id} className="flex justify-between text-[8px] font-bold">
                                    <span className="text-slate-600 truncate max-w-[100px]">{item.cartQuantity}x {item.name}</span>
                                    <span className="text-slate-900">₱{(item.price * item.cartQuantity).toFixed(2)}</span>
                                 </div>
                               ))
                             )}
                          </div>
                          <div className="flex justify-between text-[10px] font-black pt-1 mb-2">
                             <span className="text-slate-400 uppercase tracking-tighter">Total Amount</span>
                             <span>₱{cartTotal.toFixed(2)}</span>
                          </div>
                          {receiptSettings.footerMessage && (
                            <p className="text-[6px] text-center text-slate-400 italic leading-none px-2">{receiptSettings.footerMessage}</p>
                          )}
                       </div>

                       <div className="flex items-center gap-3 pt-2">
                         <Printer className="w-4 h-4 text-slate-400" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Printer Status: Online</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-end gap-4 text-left">
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Personnel Role</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20">
                         <option>All Staff</option>
                         <option>Admin</option>
                         <option>Sales Staff</option>
                         <option>Inventory Staff</option>
                      </select>
                   </div>
                   <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Action Type</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500/20">
                         <option>All Actions</option>
                         <option>Login/Logout</option>
                         <option>Update Stock</option>
                         <option>Delete Product</option>
                         <option>Add/Edit</option>
                      </select>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                         Apply Filter
                      </button>
                      <button className="flex-1 md:flex-none px-8 py-3 bg-amber-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                         <History className="w-4 h-4" /> Export Security Trail
                      </button>
                   </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden text-left">
                   <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                      <div>
                         <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">System Audit Logs</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Digital trail of all terminal activities</p>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full">
                         <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                            <tr>
                               <th className="px-8 py-5 text-left">Staff Member</th>
                               <th className="px-6 py-5 text-left">Action</th>
                               <th className="px-6 py-5 text-left">Details</th>
                               <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                         </thead>
                         <tbody className="text-[11px] font-bold text-slate-600 divide-y divide-slate-50">
                            {auditLogs.length === 0 ? (
                               <tr>
                                  <td colSpan={4} className="px-8 py-20 text-center opacity-30">
                                     <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                                     <p className="text-[10px] font-black uppercase tracking-widest">No security records found</p>
                                  </td>
                               </tr>
                            ) : auditLogs.map((log) => (
                               <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-2 h-2 rounded-full",
                                          log.role === 'Admin' ? "bg-emerald-500" : "bg-blue-500"
                                        )}></div>
                                        <div className="text-slate-800 font-black">{log.user}</div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-5">
                                     <span className={cn(
                                       "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter",
                                       log.action === 'Delete' || log.action === 'Void' ? "bg-rose-100 text-rose-600" : 
                                       log.action === 'Login' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                                     )}>{log.action}</span>
                                  </td>
                                  <td className="px-6 py-5 text-slate-400 font-medium">{log.details}</td>
                                  <td className="px-8 py-5 text-right text-slate-400 tracking-tighter">{log.timestamp}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Connectivity Summary */}
                <div className="flex gap-4">
                   <div className="flex-1 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Online Terminals</p>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <p className="text-2xl font-black text-slate-800">{onlineCount}</p>
                         </div>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                         <Wifi className="w-6 h-6" />
                      </div>
                   </div>
                   <div className="flex-1 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Offline Staff</p>
                         <p className="text-2xl font-black text-slate-800">{offlineCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                         <WifiOff className="w-6 h-6" />
                      </div>
                   </div>
                   <div className="flex items-center">
                      <button 
                        onClick={() => { resetForm(); setIsUserModalOpen(true); setSelectedUser(null); }}
                        className="px-8 py-5 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all"
                      >
                        + Add New User
                      </button>
                   </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden text-left">
                   <table className="w-full">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5 text-left">Full Name & Identity</th>
                          <th className="px-6 py-5 text-left">System Role</th>
                          <th className="px-6 py-5 text-center">Real-Time Status</th>
                          <th className="px-6 py-5 text-left">Last Active</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold text-slate-600 divide-y divide-slate-50">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors uppercase">
                                     {user.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                     <div className="text-slate-800 font-black">{user.name}</div>
                                     <div className="text-[10px] text-slate-400 tracking-tight font-medium">{user.email}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <span className={cn(
                                 "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                 user.role === 'Admin' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                               )}>{user.role}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <div className={cn("w-2.5 h-2.5 rounded-full", user.status === 'online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-200")}></div>
                                  <span className={cn("uppercase text-[9px] font-black tracking-widest", user.status === 'online' ? "text-emerald-500" : "text-slate-400")}>
                                     {user.status === 'online' ? 'Online' : 'Offline'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-slate-400 font-medium">
                               {user.status === 'online' ? <span className="text-emerald-600">Active Now</span> : user.lastActive || user.lastLogin}
                            </td>
                            <td className="px-8 py-5 text-right">
                               <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setFormData({
                                        ...formData,
                                        name: user.name,
                                        email: user.email,
                                        role: user.role,
                                        password: ''
                                      });
                                      setIsUserModalOpen(true);
                                    }}
                                    className="p-2.5 border border-slate-100 rounded-xl hover:bg-slate-100 text-slate-400 transition-all hover:text-blue-500"
                                  >
                                     <Settings className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-2.5 border border-rose-50 rounded-xl hover:bg-rose-50 text-rose-300 transition-all hover:text-rose-500"
                                  >
                                     <X className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-5 gap-8 text-left"
              >
                {/* Profile & Identity */}
                <div className="col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left">
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2 mb-6">User Profile Authenticity</h3>
                    <div className="flex items-center gap-6 mb-8">
                       <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center relative group">
                          <UserIcon className="w-10 h-10 text-slate-300 group-hover:text-amber-500 transition-colors" />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                             <ShieldCheck className="w-4 h-4" />
                          </div>
                       </div>
                       <div>
                          <p className="text-xl font-black text-slate-800">Ms. Perlin</p>
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Master Admin Access</p>
                          <div className="flex gap-2 mt-2">
                             <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">Terminal 01</span>
                             <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-tighter">Verified Device</span>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Terminal Address</p>
                          <p className="text-xs font-bold text-slate-700">perlin@judejush.com</p>
                       </div>
                       <button className="w-full py-4 border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer">Update Credentials</button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-left">
                    <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2 mb-6">System Preferences</h3>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-xs font-black text-slate-800">Automatic Backup Pulse</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Cloud-Vault Sync (Daily)</p>
                          </div>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div></div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-xs font-black text-slate-800">High Precision AI Analysis</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Requires JJ-Core Cloud Link</p>
                          </div>
                          <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer shadow-inner"><div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div></div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Receipt & Terminal Settings */}
                <div className="col-span-3 space-y-6 text-left">
                   <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden text-left">
                      <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl shadow-lg shadow-amber-500/20">
                               <Printer className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="text-lg font-black tracking-tight uppercase leading-tight">Receipt Configuration</h3>
                               <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-widest">Manage thermal output parameters</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => addNotification('Printer Diagnostic', 'Sending test print pulse to Thermal Terminal...', 'info')}
                           className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                         >
                            Test Print
                         </button>
                      </div>

                      <div className="p-8 grid grid-cols-2 gap-8">
                         {/* Part 1: Header & Branding */}
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest pb-2 border-b border-amber-50">Header & Branding</h4>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <label className="text-xs font-black text-slate-800 cursor-pointer" htmlFor="showLogo">Show JJ Store Logo</label>
                                  <input 
                                    type="checkbox" 
                                    id="showLogo"
                                    checked={receiptSettings.showLogo}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, showLogo: e.target.checked})}
                                    className="w-4 h-4 accent-amber-500"
                                  />
                               </div>
                               <div className="space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Store Name Header</label>
                                  <input 
                                    type="text" 
                                    value={receiptSettings.storeName}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, storeName: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
                                  />
                               </div>
                               <div className="space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Store Address</label>
                                  <textarea 
                                    value={receiptSettings.address}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, address: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-amber-500/10 h-20 resize-none transition-all"
                                  />
                               </div>
                               <div className="space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Contact Number</label>
                                  <input 
                                    type="text" 
                                    value={receiptSettings.contact}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, contact: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
                                  />
                               </div>
                            </div>
                         </div>

                         {/* Part 2: Layout & Dynamic Content */}
                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest pb-2 border-b border-amber-50">Layout & Content</h4>
                            <div className="space-y-4">
                               <div className="space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Receipt Font Size</label>
                                  <select 
                                    value={receiptSettings.fontSize}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, fontSize: e.target.value as any})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
                                  >
                                     <option value="small">Small (Economy)</option>
                                     <option value="medium">Medium (Standard)</option>
                                     <option value="large">Large (High Res)</option>
                                  </select>
                               </div>
                               <div className="flex items-center justify-between">
                                  <label className="text-xs font-black text-slate-800 cursor-pointer" htmlFor="includeQR">Include Secure QR Code</label>
                                  <input 
                                    type="checkbox" 
                                    id="includeQR"
                                    checked={receiptSettings.includeQR}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, includeQR: e.target.checked})}
                                    className="w-4 h-4 accent-amber-500"
                                  />
                               </div>
                               <div className="space-y-1.5 text-left">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Footer "Thank You" Message</label>
                                  <input 
                                    type="text" 
                                    value={receiptSettings.footerMessage}
                                    onChange={(e) => setReceiptSettings({...receiptSettings, footerMessage: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/10 transition-all"
                                  />
                               </div>
                            </div>

                            {/* Part 3: Printer & Connectivity */}
                            <div className="pt-6 space-y-4 border-t border-slate-100 mt-6">
                               <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest pb-2 border-b border-amber-50">Printer & Connectivity</h4>
                               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div>
                                      <p className="text-xs font-black text-slate-800 font-black">Automatic Receipt Printing</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Print on "Complete Sale"</p>
                                   </div>
                                   <div 
                                      onClick={() => setReceiptSettings({...receiptSettings, autoPrint: !receiptSettings.autoPrint})}
                                      className={cn(
                                         "w-10 h-5 rounded-full relative cursor-pointer shadow-inner transition-all",
                                         receiptSettings.autoPrint ? "bg-emerald-500" : "bg-slate-200"
                                      )}
                                   >
                                      <div className={cn(
                                         "w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all",
                                         receiptSettings.autoPrint ? "right-0.5" : "left-0.5"
                                      )}></div>
                                   </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Status Bar Footer --- */}
        <footer className="h-10 bg-slate-800 flex items-center justify-between px-6 text-[10px] text-slate-400 shrink-0 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> 
              <span className="font-bold">SYSTEM LOAD: 12%</span>
            </div>
            <div className="flex items-center gap-2 font-bold uppercase">
               BARCODE ENGINE: ACTIVE
            </div>
            <div className="flex items-center gap-2 font-bold uppercase">
               ENCRYPTION: HARDENED
            </div>
          </div>
          <div className="flex items-center gap-4 uppercase font-bold">
            <span className="text-white bg-slate-700 px-2 py-0.5 rounded">Shift Time: 06h 42m</span>
            <span className="text-blue-400">v4.2.1 Stable Build</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
