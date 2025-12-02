// js/auth.js
import { supabase } from './supabase-config.js';

/* ========== عناصر الواجهة ========== */
// تأكد أن IDs العناصر في الـ HTML مطابقة لهذه الأسماء
const loginForm = document.getElementById('loginForm');
const regForm   = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const toastEl   = document.getElementById('toast');

/* ========== أدوات مساعدة ========== */
const showToast = (msg) => {
  if (!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  setTimeout(() => toastEl.classList.add('hidden'), 3000);
};

// التوجيه حسب الدور
function routeByRole(role) {
  console.log('Routing for role:', role);
  switch ((role || '').toLowerCase()) {
    case 'admin':  location.replace('admin-doctors.html'); break;
    case 'doctor': location.replace('doctor-dashboard.html'); break;
    case 'parent': location.replace('parent-dashboard.html'); break; // أو parent.html
    default:       location.replace('index.html');
  }
}

/* ========== الوظائف الرئيسية ========== */

// 1. تسجيل مستخدم جديد
async function handleSignUp(email, password, name, role) {
  try {
    // أ. إنشاء الحساب في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: role } } // تخزين مؤقت
    });

    if (authError) throw authError;

    // ب. إدخال البيانات في جدول users الخاص بك
    // نربط auth_id الجديد بالجدول القديم
    const { error: dbError } = await supabase.from('users').insert([
      {
        email: email,
        name: name,
        role: role, // تأكد أن القيمة مطابقة للـ ENUM في قاعدة البيانات (parent, doctor, etc)
        auth_id: authData.user.id,
        is_active: true
      }
    ]);

    if (dbError) {
      console.warn('DB Insert Warning:', dbError); 
      // قد يكون التريجر عمل الإضافة، لذا لا نوقف العملية
    }

    showToast('تم إنشاء الحساب بنجاح! جاري التوجيه...');
    setTimeout(() => routeByRole(role), 1500);

  } catch (err) {
    console.error(err);
    showToast(`خطأ في التسجيل: ${err.message}`);
  }
}

// 2. تسجيل الدخول
async function handleLogin(email, password) {
  try {
    // أ. تسجيل الدخول
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // ب. جلب دور المستخدم من جدول users
    // نبحث باستخدام auth_id الذي ربطناه
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, id') // نحتاج الـ ID الرقمي أيضاً للعمليات اللاحقة
      .eq('auth_id', data.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('لم يتم العثور على ملف المستخدم.');
    }

    // حفظ الـ ID الرقمي في الجلسة لاستخدامه في باقي الصفحات
    sessionStorage.setItem('db_user_id', userProfile.id);

    showToast('تم تسجيل الدخول ✅');
    routeByRole(userProfile.role);

  } catch (err) {
    console.error(err);
    showToast('البريد أو كلمة المرور غير صحيحة');
  }
}

/* ========== تفعيل النماذج (Event Listeners) ========== */

// نموذج التسجيل
if (regForm) {
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    // افترضنا وجود Radio Button لاختيار الدور، أو نثبته كـ parent
    const roleEl = document.querySelector('input[name="role"]:checked');
    const role = roleEl ? roleEl.value : 'parent'; 
    
    await handleSignUp(email, pass, name, role);
  });
}

// نموذج الدخول
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    await handleLogin(email, pass);
  });
}

// زر الخروج
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    location.href = 'index.html';
  });
}

/* ========== مراقب الحالة (عند تحديث الصفحة) ========== */
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  // إذا كنا في صفحة login/register والمستخدم مسجل -> وجهه
  const isAuthPage = /login\.html|register\.html|index\.html/.test(location.pathname);
  
  if (session && isAuthPage) {
     // جلب الدور سريعاً
     const { data: user } = await supabase
       .from('users')
       .select('role')
       .eq('auth_id', session.user.id)
       .single();
     if(user) routeByRole(user.role);
  }
}

checkAuth();
