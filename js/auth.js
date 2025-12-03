// 1. تسجيل حساب جديد (معدل للإضافة اليدوية)
async function handleSignUp(email, password, name, role) {
  try {
    // أ. التسجيل في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (authError) throw authError;

    if (authData?.user) {
      console.log("تم التسجيل في Auth، جاري الإضافة للجدول...", authData.user.id);

      // ب. الإضافة اليدوية في جدول users
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authData.user.id, // نأخذ الـ ID من نتيجة التسجيل
          email: email,
          name: name,
          role: role,
          status: role === 'doctor' ? 'pending' : 'active'
        }
      ]);

      if (dbError) {
        console.error("خطأ في قاعدة البيانات:", dbError);
        throw new Error("فشل حفظ بيانات المستخدم: " + dbError.message);
      }

      showToast('تم إنشاء الحساب بنجاح! جاري الدخول...');
      
      // توجيه المستخدم
      setTimeout(() => {
         checkAuth();
      }, 1500);
    }

  } catch (err) {
    console.error(err);
    showToast(`خطأ: ${err.message}`, true);
  }
}
