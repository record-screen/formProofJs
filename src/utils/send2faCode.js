async function send2faCode(phone, token) {
    return await fetch(sendTfaCodeApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({cellphone: phone, token: token})
    });
}
