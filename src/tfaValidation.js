async function tfaValidation(tfaTwilio, phoneInputId, sendTfaCode, validateTfCode, saveOnSubmit, event) {
    const phoneInput = document.getElementById(phoneInputId);
    if (!phoneInput) {
        inputIdNoExist();
        return;
    }
    const phone = phoneInput.value;
    if (!phone || !regex.test(phone)) {
        showPhoneInvalidModal();
        return;
    }
    await phoneInformationModal(phone, event);
}

function showPhoneInvalidModal() {
    const phoneInvalid = document.createElement("dialog");
    phoneInvalid.id = "invalidPhone";
    phoneInvalid.classList.add("dialog-styles");
    phoneInvalid.innerHTML = `
                <button class="x" id="closePhoneModal">X</button>
                <h5>Invalid Phone</h5>
                <p>Please enter a valid phone number</p>
`;
    document.body.appendChild(phoneInvalid);

    const phoneInvalidDialog = document.getElementById("invalidPhone");
    phoneInvalidDialog.showModal();

    const closeModalPhone = document.getElementById("closePhoneModal");
    closeModalPhone.addEventListener("click", () => {
        phoneInvalidDialog.close();
    });
}

async function showTfaModal(phone, event) {
    const tfaDialog = document.createElement("dialog");
    tfaDialog.id = "tfaTwilio";
    tfaDialog.classList.add("dialog-styles");
    tfaDialog.innerHTML = `
                <button class="x" id="closeBtn">X</button>
                <h5>Two-Factor Authetication</h5>
                <p>Enter the code sent to your authentication method or provide a backup code.</p>
                <b>5-digits code</b>
                <input type="text" id="code" style="padding: 10px" maxlength="5">
                <p id="error" style="color: red;"></p>
                <p id="sendAnother" style="color: cornflowerblue; cursor: pointer;">Resend Code</p>
                <button id="sendBtn" type="submit" style="background: #0b5ed7; color: white;">Verify</button>
                <button id="closeTfa" style="margin-right: 10px">Close</button>
                            `;
    document.body.appendChild(tfaDialog);

    const tfaModal = document.getElementById("tfaTwilio");
    tfaModal.showModal();

    const closeTfaDialog = document.getElementById("closeBtn");
    closeTfaDialog.addEventListener("click", () => {
        const phoneInfo = document.getElementById("phoneInfo");
        const show2fa = document.getElementById("showTfa");
            show2fa.innerText = "Continue";
        phoneInfo.close();
        tfaModal.close();
    });

    const closeTfa = document.getElementById("closeTfa");
    closeTfa.addEventListener("click", () => {
        const phoneInfo = document.getElementById("phoneInfo");
        const show2fa = document.getElementById("showTfa");
        show2fa.innerText = "Continue";
        phoneInfo.close();
        tfaModal.close();
    });

    await verifyTfaCode(phone, event)
}

async function verifyTfaCode(phone, event) {
    const sendAnotherLink = document.getElementById("sendAnother");
    sendAnotherLink.addEventListener("click", async () => {
        await send2faCode(phone, clientToken);
        console.log('Code resent');
    });

    const sendBtn = document.getElementById("sendBtn");
    const errorText = document.getElementById("error");
    sendBtn.addEventListener("click", async () => {
        sendBtn.innerText = "Verifying...";
        sendBtn.disabled = true;
        const code = document.getElementById("code").value;
        const codeValid = await validate2faCode(code, phone);
        sendBtn.disabled = false;
        if (codeValid.status === 200) {
            console.log('formproof#onSubmit');
            if (saveOnSubmit_formtrace) {
                await saveRecording(saveOnSubmit_formtrace, event);
            }
        } else if (codeValid.status === 409) {
            errorText.textContent = "Code used. Please try again.";
            sendBtn.innerText = "Verify";
        } else if (codeValid.status === 400) {
            errorText.textContent = "Invalid code. Please enter a valid code.";
            sendBtn.innerText = "Verify";
        } else {
            errorText.textContent = "An unexpected error has occurred, please try again later.";
            sendBtn.innerText = "Verify";
        }
    });
}

function showLoading() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loadingIndicator);
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function showServerErrorModal() {
    const ftaCodeError = document.createElement("dialog");
    ftaCodeError.id = "ftaCodeError";
    ftaCodeError.classList.add("dialog-styles");
    ftaCodeError.innerHTML = `
        <button class="x" id="closeFtaError">X</button>
        <h5>Internal Server Error</h5>
        <p>An unexpected error has occurred, please try again later</p>
    `;
    document.body.appendChild(ftaCodeError);

    const ftaError = document.getElementById("ftaCodeError");
    ftaError.showModal();

    const closeFtaError = document.getElementById("closeFtaError");
    closeFtaError.addEventListener("click", async () => {
        const show2fa = document.getElementById("showTfa");
        show2fa.innerText = "Continue";
        ftaError.close();
    })
}

function inputIdNoExist () {
    const inputIdError = document.createElement("dialog");
    inputIdError.id = "inputIdError";
    inputIdError.classList.add("dialog-styles");
    inputIdError.innerHTML = `
        <button class="x" id="closeInputIdError">X</button>
        <h5>Error in phoneInputId</h5>
        <p>fix inputId since it doesn't exist</p>
        <button id="close"  style="background: #0b5ed7; color: white;">Ok</button>
    `;
    document.body.appendChild(inputIdError);

    const showErrorInputModal = document.getElementById("inputIdError")
    showErrorInputModal.showModal();

    const closeInputIdError = document.getElementById("closeInputIdError");
    closeInputIdError.addEventListener("click", () => {
        showErrorInputModal.close()
    })

    const inputIdErrorModal = document.getElementById("close");
    inputIdErrorModal.addEventListener("click", () => {
        showErrorInputModal.close()
    })
}

async function phoneInformationModal(phone, event) {
    const formattedPhone = formatPhoneNumber(phone);
    const informationPhone = document.createElement("dialog");
    informationPhone.id = "phoneInfo";
    informationPhone.classList.add("dialog-styles");
    informationPhone.innerHTML = `
        <button class="x" id="closeInfoPhone">X</button>
        <p>We need to validate your identity, we will send a validation code to the following cell phone number</p>
        <b id="cellphone" style=""></b>
        <span id="errorText" style="color: red; display: none;">Phone number not found or not valid.</span>
        <button id="showTfa" style="background: #0b5ed7; color: white;">Continue</button>
        <button id="closePhone" style="margin-right: 10px">Close</button>
    `;
    document.body.appendChild(informationPhone);

    document.getElementById('cellphone').textContent = formattedPhone;
    document.getElementById('cellphone').style.fontSize = '28px';

    const phoneInfo = document.getElementById("phoneInfo");
    phoneInfo.showModal();

    const closePhoneInfo = document.getElementById("closeInfoPhone");
    closePhoneInfo.addEventListener("click", () => {
        phoneInfo.close();
    })

    const show2fa = document.getElementById("showTfa");
    show2fa.addEventListener("click",  async () => {
        show2fa.innerText = "Sending Code...";
        show2fa.disable = true;
        const response = await send2faCode(phone, clientToken)
        if (response.status === 200 ) {
            await showTfaModal(phone, event)
        } else if (response.status === 404 || response.status === 400) {
            document.getElementById('errorText').style.display = 'block';
            show2fa.style.display = 'none';
        } else if (response.status === 500) {
            showServerErrorModal()
        }

    })

    const closePhoneModal = document.getElementById("closePhone");
    closePhoneModal.addEventListener("click", () => {
        phoneInfo.close();
    });
}

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    return formatted;
}
