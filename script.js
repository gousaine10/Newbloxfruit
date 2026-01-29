const clickSnd = document.getElementById('clickSnd');
const errorSnd = document.getElementById('errorSnd');
const selectSnd = document.getElementById('selectSnd');

let selectedCount = 0;

// 1. اختيار الفواكه
document.querySelectorAll('.claim-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (selectedCount < 3) {
            selectSnd.play();
            selectedCount++;
            const imgPath = this.parentElement.getAttribute('data-img');
            document.getElementById(`slot-${selectedCount}`).innerHTML = `<img src="${imgPath}" style="width:100%">`;
            this.innerText = "SELECTED";
            this.disabled = true;
            this.style.background = "#555";

            if (selectedCount === 3) {
                document.getElementById('next-to-login').classList.remove('hidden');
            }
        }
    });
});

// 2. الانتقال لربط الحساب
document.getElementById('next-to-login').addEventListener('click', () => {
    clickSnd.play();
    document.getElementById('step-selection').classList.add('hidden');
    document.getElementById('step-login').classList.remove('hidden');
});

// 3. Roblox API Logic
document.getElementById('connectBtn').addEventListener('click', async () => {
    const user = document.getElementById('usernameInput').value;
    const errorMsg = document.getElementById('errorMsg');
    
    if (user.length < 3) {
        errorSnd.play();
        errorMsg.classList.remove('hidden');
        return;
    }

    document.getElementById('connectBtn').innerText = "CONNECTING...";
    
    try {
        const proxy = "https://corsproxy.io/?";
        const res = await fetch(`${proxy}https://users.roblox.com/v1/users/search?keyword=${user}&limit=1`);
        const data = await res.json();

        if (data.data && data.data.length > 0) {
            const userId = data.data[0].id;
            // جلب الصورة
            const thumbRes = await fetch(`${proxy}https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
            const thumbData = await thumbRes.json();
            
            document.getElementById('userAvatar').src = thumbData.data[0].imageUrl;
            document.getElementById('displayName').innerText = data.data[0].name;
            
            document.getElementById('api-result').classList.remove('hidden');
            document.getElementById('connectBtn').classList.add('hidden');
            document.getElementById('finalStepBtn').classList.remove('hidden');
            errorMsg.classList.add('hidden');
        } else {
            throw new Error();
        }
    } catch (e) {
        errorSnd.play();
        errorMsg.classList.remove('hidden');
        document.getElementById('connectBtn').innerText = "CONNECT NOW";
    }
});

document.getElementById('finalStepBtn').addEventListener('click', () => {
    clickSnd.play();
    document.getElementById('step-login').classList.add('hidden');
    document.getElementById('step-verify').classList.remove('hidden');
});

document.getElementById('lockerTrigger').addEventListener('click', () => {
    clickSnd.play();
    if(typeof _di === "function") _di(); // استدعاء لوكر adbluemedia
});
