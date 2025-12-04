@@ -48,57 +48,67 @@ async function handleSignUp(email, password, name, role) {
    // أ. التسجيل في Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (authError) throw authError;

    if (authData?.user) {
      console.log("تم التسجيل في Auth بنجاح، جاري الإضافة للجدول...", authData.user.id);

      // ب. الإضافة اليدوية في جدول users (الجزء المهم جداً)
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: authData.user.id, // نأخذ نفس الـ ID
          email: email,
          name: name,
          role: role,
          status: role === 'doctor' ? 'pending' : 'active'
        }
      ]);

      if (dbError) {
        console.error("خطأ في قاعدة البيانات:", dbError);
        // لو حصل خطأ في الجدول، نحاول نمسح المستخدم من Auth عشان ميبقاش "معلق"
        await supabase.auth.admin.deleteUser(authData.user.id); 
        throw new Error("فشل حفظ بيانات الملف الشخصي. حاول مرة أخرى.");

        // رسائل توضيح أسرع حسب الخطأ
        const isTypeMismatch = dbError.message?.includes('uuid');
        const isRlsBlocked = dbError.message?.toLowerCase()?.includes('violates row-level security');
        const hint = isTypeMismatch
          ? 'تأكد أن عمود id في جدول users نوعه uuid ومربوط بـ auth.users.'
          : isRlsBlocked
            ? 'فعّل RLS وأضف سياسات insert/select/update بحيث id = auth.uid().'
            : 'راجع صلاحيات وسياسات جدول users في Supabase.';

        // لا يمكن حذف المستخدم من Auth باستخدام anon key، لذا نظهر التنبيه فقط
        showToast(`فشل حفظ بيانات الجدول: ${hint}`, true);
        return;
      }

      showToast('تم إنشاء الحساب بنجاح! جاري الدخول...');
      

      // انتظار بسيط ثم التحقق والتوجيه
      setTimeout(() => {
         checkAuth();
      }, 1500);
    }

  } catch (err) {
    console.error(err);
    showToast(`خطأ: ${err.message}`, true);
  }
}

// 2. تسجيل الدخول
async function handleLogin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;

    showToast('تم تسجيل الدخول!');
    checkAuth(); // التوجيه

  } catch (err) {
    console.error(err);
    showToast('البريد الإلكتروني أو كلمة المرور غير صحيحة', true);
