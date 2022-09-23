import {encode} from "base64-arraybuffer";
import {putEncryptedKV} from "encrypt-workers-kv";
import {cryptoRandomStringAsync} from 'crypto-random-string';
import randomInteger from 'random-int';

export function upload(request) {
    return handleRequest(request)
}

async function handleRequest(request) {
    let formData = await request.formData();
    const file = formData.get('file');
    const id = `D3${(await cryptoRandomStringAsync({length: 12})).toUpperCase()}`
    const data = {name: file.name, type: file.type, size: file.size, data: encode(await file.arrayBuffer())};
    const dataBinary = new TextEncoder().encode(JSON.stringify(data));
    const password = await cryptoRandomStringAsync({length: randomInteger(6, 20), type: 'alphanumeric'});
    const del_password = await cryptoRandomStringAsync({length: randomInteger(12, 32), type: 'alphanumeric'});
    try {
        await putEncryptedKV(KV_DATA, id, encode(dataBinary), password, 10001, {
            expirationTtl: file_expiration,
            metadata: {del_password: del_password}
        })
        return new Response(JSON.stringify({
            password: password,
            url: `${download_fqdn}/${id}/${password}`,
            id: id,
            deletepassword: del_password
        }, null, 2), {
            status: 201,
            headers: {
                'Content-Type': 'Application/JSON',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,DELETE'
            }
        })
    } catch (e) {
        return new Response(e.message, {status: e.status})
    }
}
