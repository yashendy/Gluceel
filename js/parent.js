import { supabase } from './supabase-config.js';

// عناصر الصفحة
const grid = document.getElementById('childrenGrid');
const modal = document.getElementById('addModal');
const form = document.getElementById('addChildForm');
const logoutBtn = document.getElementById('logoutBtn');

// 1. التأكد من تسجيل الدخول
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html'; // لو مش مسجل اطرده
        return null;
    }
    return session.user;
}

// 2. جلب وعرض الأطفال
async function loadChildren() {
    const user = await checkSession();
    if (!user) return;

    // استعلام من قاعدة البيانات
    const { data: children, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('parent_id', user.id) // هات عيال المستخدم ده بس
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching children:', error);
        grid.innerHTML = '<p style="color:red">حدث خطأ في جلب البيانات</p>';
        return;
    }

    renderChildren(children);
}

// 3. رسم الكروت (HTML Generation)
function renderChildren(children) {
    grid.innerHTML = ''; // مسح التحميل

    if (children.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #777; padding: 40px;">
                <i class="fas fa-child" style="font-size: 40px; margin-bottom: 10px; color: #ddd;"></i>
                <p>لم تقم بإضافة أطفال بعد.<br>ابدأ بإضافة طفلك الأول!</p>
            </div>
        `;
        return;
    }

    children.forEach(child => {
        const age = calculateAge(child.birth_date);
        const avatar = child.gender === 'female' ? '👧' : '👦';
        
        const card = document.createElement('div');
        card.className = 'child-card';
        card.innerHTML = `
            <button class="btn-delete" onclick="deleteChild('${child.id}')" title="حذف الملف"><i class="fas fa-trash"></i></button>
            <div class="avatar-circle">${avatar}</div>
            <div class="card-name">${child.name}</div>
            <div class="card-info">
                ${age} سنوات • ${child.diabetes_type === 'type1' ? 'النوع الأول' : 'النوع الثاني'}
            </div>
            <button class="btn-card" onclick="openDashboard('${child.id}')">
                فتح الملف <i class="fas fa-arrow-left" style="font-size:0.8em"></i>
            </button>
        `;
        grid.appendChild(card);
    });
}

// 4. إضافة طفل جديد
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await checkSession();
    
    // تجميع البيانات من الفورم
    const newChild = {
        parent_id: user.id,
        name: document.getElementById('childName').value,
        gender: document.getElementById('childGender').value,
        birth_date: document.getElementById('childDob').value,
        diabetes_type: document.getElementById('childType').value
    };

    const { error } = await supabase.from('child_profiles').insert([newChild]);

    if (error) {
        alert('حدث خطأ أثناء الحفظ: ' + error.message);
    } else {
        closeModal();
        form.reset();
        loadChildren(); // تحديث القائمة فوراً
    }
});

// 5. وظائف مساعدة (Modal & Delete)
window.openModal = () => modal.style.display = 'flex';
window.closeModal = () => modal.style.display = 'none';

window.deleteChild = async (id) => {
    if (confirm('هل أنت متأكد من حذف ملف هذا الطفل؟ لا يمكن التراجع.')) {
        const { error } = await supabase.from('child_profiles').delete().eq('id', id);
        if (!error) loadChildren();
    }
};

window.openDashboard = (childId) => {
    // هنحفظ الـ ID عشان نستخدمه في الصفحة الجاية
    sessionStorage.setItem('active_child_id', childId);
    // هنا هنوجه لصفحة الداشبورد الرئيسية (لسه هنعملها)
    alert('سيتم الانتقال للوحة تحكم الطفل: ' + childId);
    // window.location.href = 'dashboard.html'; 
};

function calculateAge(dob) {
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// تسجيل الخروج
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
});

// بدء التشغيل
loadChildren();
