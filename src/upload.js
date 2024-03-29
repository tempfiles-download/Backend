import {encode} from "base64-arraybuffer";
import {cryptoRandomStringAsync} from 'crypto-random-string';
import randomInteger from 'random-int';
import {encryptData} from "./encryption";
const headers = {
    'Content-Type': 'Application/JSON',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE'
}
export async function upload(request) {
  let formData = await request.formData();
  const token_valid = await validateCaptcha(formData, request.headers)

  if (token_valid.success) {
    const file = formData.get('file');
    const id = `D${server_ID}${(await cryptoRandomStringAsync({length: 12})).toUpperCase()}`
    const data = {name: file.name, type: file.type, size: file.size, data: encode(await file.arrayBuffer())};
    const dataBinary = new TextEncoder().encode(JSON.stringify(data));
    const {searchParams} = new URL(request.url)
    const password = searchParams.get('p') ? searchParams.get('p') : (await cryptoRandomStringAsync({
      length: randomInteger(6, 20),
      type: 'alphanumeric'
    }));
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
        headers: headers
      })
    } catch (e) {
      return new Response(e.message, {status: e.status, headers: headers})
    }
  } else {
    return new Response(JSON.stringify({error: 'Failed to validate captcha'}), {status: 401, headers})
  }
}

async function validateCaptcha(formData, headers) {
  if (!formData.get('cf-turnstile-response'))
    return new Response(JSON.stringify({error: 'Missing turnstile token'}), {status: 422, headers});

  const ip = headers.get('CF-Connecting-IP');
  const form = new FormData();
  form.append('secret', SECRET_KEY);
  form.append('response', formData.get('cf-turnstile-response'));
  form.append('remoteip', ip);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const result = await fetch(url, {body: form, method: 'POST'});
  return await result.json();
}