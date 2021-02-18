feather.replace();

function request(obj){
    return new Promise(function(resolve, reject){
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || "GET", obj.url + "?t=" + Math.random());
        if (obj.headers) {
            Object.keys(obj.headers).forEach(function(key){
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.onload = function(){
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function(){ reject(xhr.statusText) };
        xhr.send(obj.body);
    });
}

function random_string(length) {
    let result = '';
    const characters = 'A1B2C3D4E5F6G7H8I9JKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}