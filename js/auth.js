// js/auth.js (تحديث دالة التحقق فقط)

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // التغيير هنا: نبحث بـ id مباشرة لأننا وحدنا المفاتيح
    const { data: user, error } = await supabase
      .from('users')
      .select('role, status, id')
      .eq('id', session.user.id) // التعديل هنا: id بدلاً من auth_id
      .single();

    if (user) {
      sessionStorage.setItem('db_user_id', user.id);
      
      // لا نوجه المستخدم إذا كان بالفعل في الصفحة الصحيحة
      const currentPath = location.pathname;
      if (user.role === 'parent' && !currentPath.includes('parent.html')) {
          routeByRole(user.role, user.status);
      } else if (user.role === 'doctor' && !currentPath.includes('doctor')) {
          routeByRole(user.role, user.status);
      }
    }
  }
}
