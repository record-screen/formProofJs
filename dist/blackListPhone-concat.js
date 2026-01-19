async function blackListPhone(tfaTwilio, blackList, phoneInputId, validateBlackList, saveOnSubmit, event) {
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
    showLoading()
    await validatePhoneInBlackList(tfaTwilio, blackList, phone, saveOnSubmit, event);
    hideLoading()
}


async function validatePhoneInBlackList(tfaTwilio, validateBlackList, phone, saveOnSubmit, event) {
    const verifyPhone = await verifyPhoneBlackListApi(phone, clientToken)
    const verify = await verifyPhone.json();
    if (verify.valid === true && verify.showTfa === true) {
        await phoneInformationModal(phone, event)
    } else if (verify.valid === false && verify.showTfa === true) {
        await phoneInformationModal(phone, event)
    } else if (verify.valid === true && verify.showTfa === false) {
        await saveRecording(saveOnSubmit, event)
    }
}
