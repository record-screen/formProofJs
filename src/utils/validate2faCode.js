async function validate2faCode(code, phone) {
    return await fetch(validateTfCodeApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({code: code, cellphone: phone})
    });
}
