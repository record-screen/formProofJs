async function saveRecordings(dataSubmit, useKeepalive = false) {
    const options = {
        method: 'POST',
        body: JSON.stringify(dataSubmit),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    // keepalive permite que la peticion continue aunque la pagina cambie
    // Ideal para formularios ASP.NET con multiples pasos
    if (useKeepalive) {
        options.keepalive = true;
    }

    return await fetch(formTraceApiSave, options);
}
