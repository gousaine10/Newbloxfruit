const sndClick = document.getElementById('sndClick');
const sndError = document.getElementById('sndError');
const sndSelect = document.getElementById('sndSelect');

let selectedFruits = 0;

document.getElementById('connectBtn').addEventListener('click', async () => {
    const user = document.getElementById('usernameInput').value;
    const errorMsg = document.getElementById('errorText');
    
    // محاكاة الاتصال بـ API (استخدم الكود السابق للربط الحقيقي)
    if(user.length < 3) {
        sndError.play();
        errorMsg.classList.remove('hidden');
    } else {
        sndClick.play();
        document.getElementById('step-login').classList.add('hidden');
        document.getElementById('step-fruits').classList.remove('hidden');
    }
});

// منطق اختيار الفواكه
document.querySelectorAll('.fruit-item button').forEach(btn => {
    btn.addEventListener('click', function() {
        if(selectedFruits < 3) {
            sndSelect.play();
            selectedFruits++;
            const fruitImg = this.parentElement.querySelector('img').src;
            document.getElementById(`slot-${selectedFruits}`).innerHTML = `<img src="${fruitImg}" width="80">`;
            this.disabled = true;
            this.innerText = "ADDED";
            
            if(selectedFruits === 3) {
                document.getElementById('continueBtn').classList.remove('hidden');
            }
        }
    });
});

document.getElementById('continueBtn').addEventListener('click', () => {
    sndClick.play();
    document.getElementById('step-fruits').classList.add('hidden');
    document.getElementById('step-verify').classList.remove('hidden');
});

document.getElementById('lockerBtn').addEventListener('click', () => {
    sndClick.play();
    if(typeof _di === "function") _di(); // فتح اللوكر
});
