/**
 * Holiday Outboards API helpers (Neon via Netlify Functions).
 */
window.HO_API = {
  base: '/api'
};

window.hoFormatPrice = function hoFormatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Enquire';
  const n = Number(price);
  if (Number.isNaN(n)) return 'Enquire';
  return '$' + n.toLocaleString('en-NZ', { maximumFractionDigits: 0 });
};

window.hoGetToken = function hoGetToken() {
  return localStorage.getItem('ho_admin_token') || '';
};

window.hoSetToken = function hoSetToken(token) {
  if (token) localStorage.setItem('ho_admin_token', token);
  else localStorage.removeItem('ho_admin_token');
};

window.hoApi = async function hoApi(path, options) {
  const opts = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const token = window.hoGetToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(window.HO_API.base + path, Object.assign({}, opts, { headers: headers }));
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) { data = { error: text }; }
  if (!res.ok) {
    const err = new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

/** Compress an image File to JPEG base64 (max edge 1200px). */
window.hoFileToImagePayload = function hoFileToImagePayload(file) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      const max = 1200;
      let w = img.width;
      let h = img.height;
      if (w > max || h > max) {
        const scale = Math.min(max / w, max / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve({ contentType: 'image/jpeg', dataBase64: dataUrl });
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
};
