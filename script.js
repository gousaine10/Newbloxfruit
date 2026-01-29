document.addEventListener('DOMContentLoaded', () => {
    // --- تعريف العناصر الصوتية ---
    const audioClick = document.getElementById('audioClick');
    const audioSuccess = document.getElementById('audioSuccess');
    const audioError = document.getElementById('audioError');

    // وظائف مساعدة لتشغيل الصوت
    const playClick = () => { audioClick.currentTime = 0; audioClick.play(); };
    const playError = () => { audioError.currentTime = 0; audioError.play(); };
    const playSuccess = () => { audioSuccess.currentTime = 0; audioSuccess.play(); };

    // --- عناصر واجهة المستخدم ---
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    
    const usernameInput = document.getElementById('usernameInput');
    const inputError = document.getElementById('inputError');
    const connectBtn = document.getElementById('connectBtn');
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    const profileCard = document.getElementById('profileCard');
    const step2Buttons = document.getElementById('step2Buttons');

    // --- وظائف التنقل ---
    function switchStep(current, next) {
        current.classList.add('hidden');
        current.classList.remove('active');
        next.classList.remove('hidden');
        setTimeout(() => next.classList.add('active'), 50); // تأخير بسيط للأنميشن
    }

    // --- دالة جلب بيانات روبلوكس API ---
    // ملاحظة: نستخدم بروكسي لتجاوز مشاكل CORS في المتصفح
    async function fetchRobloxData(username) {
        const CORS_PROXY = "https://corsproxy.io/?";
        
        try {
            // 1. البحث عن المستخدم للحصول على الـ ID
            const searchUrl = `${CORS_PROXY}https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`;
            const searchResp = await fetch(searchUrl);
            const searchData = await searchResp.json();

            if (!searchData.data || searchData.data.length === 0) {
                throw new Error("User not found");
            }

            const userId = searchData.data[0].id;
            const displayUsername = searchData.data[0].name;

            // 2. جلب صورة الأفاتار (Headshot)
            const avatarUrl = `${CORS_PROXY}https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png&isCircular=false`;
            const avatarResp = await fetch(avatarUrl);
            const avatarData = await avatarResp.json();
            const finalAvatar = avatarData.data[0].imageUrl;

            // 3. جلب عدد المتابعين (Followers)
            const followersUrl = `${CORS_PROXY}https://friends.roblox.com/v1/users/${userId}/followers/count`;
            const followersResp = await fetch(followersUrl);
            const followersData = await followersResp.json();

             // 4. جلب عدد الذين يتابعهم (Followings)
            const followingsUrl = `${CORS_PROXY}https://friends.roblox.com/v1/users/${userId}/followings/count`;
            const followingsResp = await fetch(followingsUrl);
            const followingsData = await followingsResp.json();

            return {
                username: displayUsername,
                avatar: finalAvatar,
                followers: followersData.count,
                following: followingsData.count
            };

        } catch (error) {
            console.error("API Error:", error);
            throw error; // إعادة رمي الخطأ ليتم التقاطه في دالة الزر
        }
    }

    // --- التعامل مع زر الاتصال (STEP 1) ---
    connectBtn.addEventListener('click', async () => {
        playClick();
        const username = usernameInput.value.trim();
        
        // تنظيف رسائل الخطأ السابقة
        inputError.classList.add('hidden');
        usernameInput.style.borderColor = "#333";

        if (username === "") {
            playError();
            inputError.textContent = "Please enter a username.";
            inputError.classList.remove('hidden');
            return;
        }

        // الانتقال للخطوة 2 وبدء التحميل
        switchStep(step1, step2);
        loadingSpinner.classList.remove('hidden');
        profileCard.classList.add('hidden');
        step2Buttons.classList.add('hidden');

        try {
            // استدعاء الـ API
            const data = await fetchRobloxData(username);
            
            // تحديث البيانات في الصفحة
            document.getElementById('userAvatar').src = data.avatar;
            document.getElementById('userNameDisplay').textContent = data.username;
            document.getElementById('followersCount').textContent = data.followers.toLocaleString();
            document.getElementById('followingCount').textContent = data.following.toLocaleString();

            // إخفاء التحميل وإظهار البروفايل
            playSuccess();
            loadingSpinner.classList.add('hidden');
            profileCard.classList.remove('hidden');
            step2Buttons.classList.remove('hidden');

        } catch (error) {
            // في حال حدوث خطأ (المستخدم غير موجود)
            playError();
            switchStep(step2, step1); // العودة للخطوة الأولى
            inputError.textContent = "User not found!";
            inputError.classList.remove('hidden');
            usernameInput.style.borderColor = "var(--error-color)";
        }
    });

    // --- أزرار الخطوة 2 ---
    document.getElementById('wrongAccountBtn').addEventListener('click', () => {
        playClick();
        switchStep(step2, step1);
        usernameInput.value = '';
    });

    document.getElementById('confirmAccountBtn').addEventListener('click', () => {
        playClick();
        // هنا يمكنك إضافة خطوة اختيار الفواكه إذا أردت
        // حالياً سننتقل مباشرة لخطوة التحقق النهائي
        switchStep(step2, step3);
    });

    // --- زر التحقق النهائي (STEP 3) ---
    document.getElementById('finalVerifyBtn').addEventListener('click', () => {
        playClick();
        console.log("Opening Content Locker...");
        
        // *** هام جداً ***
        // استبدل السطر التالي بدالة فتح اللوكر الخاصة بـ ADBLUEMEDIA
        // مثال: _di();
        
        setTimeout(() => {
             if (typeof _di === "function") {
                 _di(); 
             } else {
                 alert("Content Locker function (_di) not found. Make sure you added the AdBlueMedia script to the head.");
             }
        }, 500);
    });
});
