import {encode} from "base64-arraybuffer";
import {cryptoRandomStringAsync} from 'crypto-random-string';
import randomInteger from 'random-int';
import {encryptData} from "./encryption";

export async function upload(request) {
    let formData = await request.formData();
    const file = formData.get('file');
    const id = `D${server_ID}${(await cryptoRandomStringAsync({length: 12})).toUpperCase()}`
    const data = {name: file.name, type: file.type, size: file.size, data: encode(await file.arrayBuffer())};
    const dataBinary = new TextEncoder().encode(JSON.stringify(data));
    const {searchParams} = new URL(request.url)
    const password = searchParams.get('p') ? searchParams.get('p') : (await cryptoRandomStringAsync({length: randomInteger(6, 20), type: 'alphanumeric'}));
    const del_password = await cryptoRandomStringAsync({length: randomInteger(12, 32), type: 'alphanumeric'});
    try {
        const encryptedData = await encryptData(encode(dataBinary), password);
        await R2.put(id, encryptedData, {customMetadata: {deletion: del_password}})
        return new Response(JSON.stringify({
            url: `${download_fqdn}/${id}/${password}`,
            password: password,
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
    }catch (e){
        return new Response(e.message, {status: e.status})
    }
}
