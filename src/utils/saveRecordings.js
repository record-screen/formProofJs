async function saveRecordings(dataSubmit) {
    return await fetch(_formTraceApiSave, {
        method: 'POST',
        body: JSON.stringify(dataSubmit),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
