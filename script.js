document.addEventListener('DOMContentLoaded', () => {

    // --- حالة التطبيق (State) ---
    let state = {
        selectedFruits: [],
        username: '',
        robloxId: null,
    };

    // --- مراجع عناصر DOM ---
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4')
    };
    const slots = [
        document.getElementById('slot1'),
        document.getElementById('slot2'),
        document.getElementById('slot3')
    ];
    const continueBtn1 = document.getElementById('continueBtn1');
    const fruitItems = document.querySelectorAll('.fruit-item');
    const usernameInput = document.getElementById('usernameInput');
    const submitBtn2 = document.getElementById('submitBtn2');
    const cancelBtn2 = document.getElementById('cancelBtn2');
    
    // عناصر البروفايل
    const loadingProfile = document.getElementById('loadingProfile');
    const profileData = document.getElementById('profileData');
    const errorProfile = document.getElementById('errorProfile');
    const userAvatar = document.getElementById('userAvatar');
    const displayName = document.getElementById('displayName');
    const followersCount = document.getElementById('followersCount');
    const followingCount = document.getElementById('followingCount');
    const confirmBtn3 = document.getElementById('confirmBtn3');
    const backBtnError = document.getElementById('backBtnError');

    // --- مراجع الأصوات ---
    const soundSelect = document.getElementById('sound-select');
    const soundButton = document.getElementById('sound-button');

    // --- دوال مساعدة ---

    // دالة لتشغيل الصوت (تعيد تشغيله من البداية لتجنب التداخل)
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; 
            // نستخدم catch لتجنب الأخطاء إذا منع المتصفح التشغيل التلقائي
            audioElement.play().catch(e => console.warn("Sound autoplay blocked initially."));
        }
    }

    // دالة للتنقل بين الخطوات
    function switchStep(toStep) {
        Object.values(steps).forEach(step => step.classList.remove('active'));
        steps[toStep].classList.add('active');
    }

    // --- منطق الخطوة 1: اختيار الفواكه ---
    fruitItems.forEach(item => {
        item.addEventListener('click', () => {
            playSound(soundSelect); // تشغيل صوت الاختيار

            const fruitId = item.getAttribute('data-fruit-id');
            const fruitImgElement = item.querySelector('img');
            
            // تحقق من وجود الصورة لتجنب الأخطاء
            if (!fruitImgElement) return;
            const fruitImgSrc = fruitImgElement.src;

            // التحقق مما إذا كانت الفاكهة مختارة بالفعل
            const index = state.selectedFruits.findIndex(f => f.id === fruitId);

            if (index > -1) {
                // إلغاء الاختيار
                state.selectedFruits.splice(index, 1);
                item.classList.remove('selected');
            } else {
                // اختيار جديد (إذا كان العدد أقل من 3)
                if (state.selectedFruits.length < 3) {
                    state.selectedFruits.push({ id: fruitId, img: fruitImgSrc });
                    item.classList.add('selected');
                }
            }
            updateSlots(); // تحديث الخانات العلوية
        });
    });

    // تحديث شكل الخانات العلوية بناءً على الاختيارات
    function updateSlots() {
        // تصفير الخانات
        slots.forEach(slot => {
            slot.style.backgroundImage = 'none';
            slot.classList.remove('filled');
        });

        // ملء الخانات بالصور المختارة
        state.selectedFruits.forEach((fruit, i) => {
            if (slots[i]) {
                slots[i].style.backgroundImage = `url(${fruit.img})`;
                slots[i].classList.add('filled');
            }
        });

        // تفعيل زر المتابعة فقط عند اختيار 3 فواكه
        if (state.selectedFruits.length === 3) {
            continueBtn1.disabled = false;
            continueBtn1.classList.remove('disabled');
        } else {
            continueBtn1.disabled = true;
            continueBtn1.classList.add('disabled');
        }
    }

    // زر المتابعة للخطوة 2
    continueBtn1.addEventListener('click', () => {
        playSound(soundButton);
        switchStep(2);
    });


    // --- منطق الخطوة 2: إدخال اسم المستخدم ---
    submitBtn2.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username.length >= 3) {
            playSound(soundButton);
            state.username = username;
            fetchRobloxData(username); // البدء في جلب البيانات
            switchStep(3);
        } else {
            alert("الرجاء إدخال اسم مستخدم صحيح (3 حروف على الأقل)");
        }
    });

    cancelBtn2.addEventListener('click', () => {
        playSound(soundButton);
        switchStep(1); // العودة للخطوة الأولى
    });


    // --- منطق الخطوة 3: جلب بيانات Roblox API ---
    async function fetchRobloxData(username) {
        // إظهار التحميل وإخفاء الباقي
        loadingProfile.style.display = 'block';
        profileData.style.display = 'none';
        errorProfile.style.display = 'none';

        // استخدام بروكسي لتجاوز قيود CORS في المتصفح (لأغراض العرض)
        // في بيئة إنتاج حقيقية، يفضل استخدام بروكسي خاص بك (Backend).
        const proxy = 'https://corsproxy.io/?';
        
        try {
            // 1. البحث عن معرف المستخدم (ID) من الاسم
            const searchUrl = `https://users.roblox.com/v1/users/search?keyword=${username}&limit=1`;
            const searchResp = await fetch(proxy + encodeURIComponent(searchUrl));
            if (!searchResp.ok) throw new Error("Network response was not ok");
            const searchData = await searchResp.json();

            if (!searchData.data || searchData.data.length === 0) {
                throw new Error("User not found");
            }

            state.robloxId = searchData.data[0].id;
            const userId = state.robloxId;

            // 2. جلب البيانات الثلاثة في وقت واحد (الصورة، المعلومات الأساسية، عدد الأصدقاء)
            // ملاحظة: نستخدم API الأصدقاء (Friends) لعرض رقم تقريبي للمتابعين لأن API المتابعين الحقيقي قد يكون مقيداً.
            const [avatarResp, infoResp, friendsResp] = await Promise.all([
                fetch(proxy + encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=true`)),
                fetch(proxy + encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`)),
                fetch(proxy + encodeURIComponent(`https://friends.roblox.com/v1/users/${userId}/friends/count`))
            ]);

            const avatarData = await avatarResp.json();
            const infoData = await infoResp.json();
            const friendsData = await friendsResp.json();

            // 3. تحديث واجهة المستخدم بالبيانات
            if (avatarData.data && avatarData.data[0] && avatarData.data[0].imageUrl) {
                userAvatar.src = avatarData.data[0].imageUrl;
            } else {
                 // صورة افتراضية في حال فشل جلب الصورة
                userAvatar.src = 'https://via.placeholder.com/150?text=No+Avatar';
            }
            
            displayName.textContent = infoData.displayName || infoData.name;
            
            // تنسيق الأرقام لعرضها بشكل جمالي (K/M)
            // هنا نستخدم عدد الأصدقاء ونضربه في رقم عشوائي لإعطاء انطباع بعدد متابعين كبير (للعرض فقط)
            const fakeFollowers = friendsData.count * (Math.floor(Math.random() * 100) + 50);
            followersCount.textContent = formatNumber(fakeFollowers > 0 ? fakeFollowers : 0); 
            followingCount.textContent = formatNumber(friendsData.count);

            // إظهار البيانات وإخفاء التحميل
            loadingProfile.style.display = 'none';
            profileData.style.display = 'block';

        } catch (error) {
            console.error("API Error:", error);
            loadingProfile.style.display = 'none';
            errorProfile.style.display = 'block'; // إظهار رسالة الخطأ
        }
    }

    // دالة مساعدة لتنسيق الأرقام الكبيرة
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0','') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0','') + 'K';
        return num;
    }

    // أزرار الخطوة 3
    backBtnError.addEventListener('click', () => {
        playSound(soundButton);
        switchStep(2); // العودة لتصحيح الاسم
    });
    confirmBtn3.addEventListener('click', () => {
        playSound(soundButton);
        switchStep(4); // الانتقال للخطوة الأخيرة
    });

    // --- منطق الخطوة 4: القفل النهائي ---
    const finalRobotBtn = document.querySelector('.robot-btn');
    if (finalRobotBtn) {
        finalRobotBtn.addEventListener('click', () => {
             playSound(soundButton);
             // دالة _Nr() الخاصة بالقفل ستعمل تلقائياً لأنها مضمنة في كود HTML
             console.log("Locker triggered...");
        });
    }

});
