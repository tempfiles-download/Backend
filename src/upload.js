import {cryptoRandomStringAsync} from 'crypto-random-string';
import randomInteger from 'random-int';
import {encode} from "base64-arraybuffer";
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
    const del_password = await cryptoRandomStringAsync({length: randomInteger(12, 32), type: 'alphanumeric'});
    try {
      await R2.put(id, file, {customMetadata: {deletion: del_password}})
      return new Response(JSON.stringify({
        url: `${download_fqdn}/${id}/`,
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
    return new Response(JSON.stringify({error: 'Failed to validate captcha'}), {status: 401, headers: headers})
  }
}

async function validateCaptcha(formData, headers) {
  if (!formData.get('cf-turnstile-response'))
    return new Response(JSON.stringify({error: 'Missing turnstile token'}), {status: 422, headers});

  const ip = headers.get('CF-Connecting-IP');
  const form = new FormData();
  form.append('secret', '1x0000000000000000000000000000000AA');
  form.append('response', formData.get('cf-turnstile-response'));
  form.append('remoteip', ip);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const result = await fetch(url, {body: form, method: 'POST'});
  return await result.json();
}