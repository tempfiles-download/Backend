import {encode} from "base64-arraybuffer";
import {putEncryptedKV} from "encrypt-workers-kv";
import {cryptoRandomStringAsync} from 'crypto-random-string';
import randomInteger from 'random-int';

export function upload(request) {
    return handleRequest(request)
}

const base = 'https://api3.tempfiles.download';

async function handleRequest(request) {
    let formData = await request.formData();
    const file = formData.get('file');
    const fileData = await file.arrayBuffer();
    const id = `D3${(await cryptoRandomStringAsync({length: 12})).toUpperCase()}`
    const data = {name: file.name, type: file.type, size: file.size, data: encode(fileData)};
    const dataBinary = new TextEncoder().encode(JSON.stringify(data));
    const password = await cryptoRandomStringAsync({length: randomInteger(6, 20), type: 'alphanumeric'});
    const del_password = await cryptoRandomStringAsync({length: randomInteger(12, 32), type: 'alphanumeric'});
    try {
        await putEncryptedKV(KV_DATA, id, encode(dataBinary), password, 10001, {expirationTtl: 86400,})
        return new Response(JSON.stringify({
            password: password,
            url: `${base}/${id}/${password}`,
            id: id,
            deletepassword: del_password
        }, null, 2), {
            status: 201,
            headers: {
                'Content-Type': 'Application/JSON'
            }
        })
    } catch (e) {
        return new Response(e.message, {status: e.status})
    }
}
