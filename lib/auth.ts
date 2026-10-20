import crypto from 'node:crypto';

const API_KEY = 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0';
const OOB_HEADERS = {
  'Content-Type': 'application/json',
  'X-Android-Package': 'com.alightcreative.motion',
  'X-Android-Cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
  'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 15; 23127PN0CC Build/BP1A.250505.005)',
};

export class AlightMotionAuth {
  orderId: string;
  productId: string;
  token: string;
  skuType: string;
  fcmToken: string;

  constructor() {
    this.orderId = 'faykal';
    this.productId = 'am.full.sub.annual.19q4';
    this.token =
      'ndnccldphehmcdeihplilfed.AO-J1OyW90adCvVh-FjXKdXV_K6wr82pxY7HQC65iRo0UgNuKeqhEOQ9BUN1qIlwXP3kdhdsTUy7pKTdP5jJbTWftXmOsiaMHIZbJtTvNcLHdrWf5wMGHdk';
    this.skuType = 'subs';
    this.fcmToken =
      'cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI';
  }

  generateCodeOrder(): string {
    return crypto.randomInt(10000, 99999).toString();
  }

  extractOobCode(fullUrl: string): string | null {
    if (!fullUrl) return null;
    try {
      let cleanUrl = fullUrl.replace(/&amp;/g, '&');
      try {
        cleanUrl = decodeURIComponent(cleanUrl);
      } catch {}

      try {
        const urlObj = new URL(cleanUrl);
        let oobCode = urlObj.searchParams.get('oobCode');
        if (!oobCode) {
          const nestedLink =
            urlObj.searchParams.get('link') ||
            urlObj.searchParams.get('q') ||
            urlObj.searchParams.get('url');
          if (nestedLink) {
            try {
              oobCode = new URL(nestedLink).searchParams.get('oobCode');
            } catch {}
          }
        }
        if (oobCode) return oobCode.replace(/[^a-zA-Z0-9_-]/g, '');
      } catch {}

      const match =
        cleanUrl.match(/[?&]oobCode=([a-zA-Z0-9_-]+)/i) ||
        cleanUrl.match(/oobCode=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) return match[1];

      const t = fullUrl.trim();
      if (/^[a-zA-Z0-9_-]{10,}$/.test(t) && !t.includes('://')) return t;

      return null;
    } catch {
      return null;
    }
  }

  async _post(url: string, body: any, headers?: Record<string, string>): Promise<any> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error((res.status ? 'HTTP ' + res.status + ': ' : '') + text.slice(0, 500));
    }
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text };
    }
  }

  async sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this._post(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/createAuthUri?key=${API_KEY}`,
        { identifier: email, continueUri: 'http://localhost' },
        OOB_HEADERS
      );
      await this._post(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=${API_KEY}`,
        {
          requestType: 6,
          email: email,
          androidInstallApp: true,
          canHandleCodeInApp: true,
          continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
          iosBundleId: 'com.alightcreative.motion',
          androidPackageName: 'com.alightcreative.motion',
          androidMinimumVersion: '585',
          clientType: 'CLIENT_TYPE_ANDROID',
        },
        OOB_HEADERS
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async verifyAndFetchProfile(
    email: string,
    rawLink: string
  ): Promise<{
    success: boolean;
    error?: string;
    idToken?: string;
    refreshToken?: string;
    localId?: string;
    isNewUser?: boolean;
    user?: any;
  }> {
    try {
      const oobCode = this.extractOobCode(rawLink);
      if (!oobCode) throw new Error('Gagal mengekstrak oobCode.');

      const signin = await this._post(
        `https://www.googleapis.com/identitytoolkit/v3/relyingparty/emailLinkSignin?key=${API_KEY}`,
        { email: email, oobCode: oobCode, clientType: 'CLIENT_TYPE_ANDROID' },
        OOB_HEADERS
      );

      let user = null;
      try {
        const acc = await this._post(
          `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${API_KEY}`,
          { idToken: signin.idToken },
          OOB_HEADERS
        );
        user = (acc.users || [])[0] || null;
      } catch {}

      return {
        success: true,
        idToken: signin.idToken,
        refreshToken: signin.refreshToken,
        localId: signin.localId,
        isNewUser: signin.isNewUser,
        user: user,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async applyPremium(
    idToken: string
  ): Promise<{ success: boolean; data?: any; codeorder?: string; orderId?: string; error?: string }> {
    try {
      const codeorder = this.generateCodeOrder();
      const orderId = `${this.orderId}-${codeorder}`;
      const res = await fetch('https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + idToken,
          'firebase-instance-id-token': this.fcmToken,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept-Encoding': 'gzip',
          'User-Agent': 'okhttp/3.12.1',
        },
        body: JSON.stringify({
          data: {
            productId: this.productId,
            token: this.token,
            skuType: this.skuType,
            orderId: orderId,
          },
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error((res.status ? 'HTTP ' + res.status + ': ' : '') + text.slice(0, 500));
      }

      let data: any = text;
      try {
        data = JSON.parse(text);
      } catch {}

      // Evaluate verification outcome
      const envelope = typeof data === 'object' ? data : null;
      if (envelope?.error) {
        return {
          success: false,
          error: envelope.error?.message || 'Server aktivasi mengembalikan kesalahan.',
          data,
          codeorder,
          orderId,
        };
      }

      const result = envelope?.result ?? envelope?.data ?? envelope;
      const status =
        result && typeof result === 'object' && typeof result.status === 'string'
          ? result.status.toUpperCase()
          : '';
      const textResult = typeof result === 'string' ? result.toUpperCase() : '';

      const confirmed =
        result === true ||
        (result &&
          typeof result === 'object' &&
          (result.success === true ||
            result.ok === true ||
            result.active === true ||
            result.premium === true ||
            status === 'ACTIVE' ||
            status === 'SUCCESS' ||
            status === 'OK' ||
            status === 'SUBSCRIPTION_STATE_ACTIVE')) ||
        /SUCCESS|ACTIVE|VERIFIED/.test(textResult) ||
        (!envelope?.error && res.ok);

      return {
        success: confirmed,
        data,
        codeorder,
        orderId,
        error: confirmed ? undefined : 'Server aktivasi tidak mengonfirmasi bahwa Premium aktif.',
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// Global instance for functional API compatibility
const defaultAuthInstance = new AlightMotionAuth();

export function code(raw: string): string | null {
  return defaultAuthInstance.extractOobCode(raw);
}

export async function link(email: string): Promise<{ ok: boolean; why?: string }> {
  const result = await defaultAuthInstance.sendMagicLink(email);
  return {
    ok: result.success,
    why: result.error,
  };
}

export async function auth(
  email: string,
  raw: string
): Promise<{
  ok: boolean;
  why?: string;
  email?: string;
  id?: string;
  ref?: string;
  uid?: string;
  baru?: boolean;
  user?: any;
}> {
  const result = await defaultAuthInstance.verifyAndFetchProfile(email, raw);
  if (!result.success) {
    return {
      ok: false,
      why: result.error,
    };
  }

  return {
    ok: true,
    email,
    id: result.idToken,
    ref: result.refreshToken,
    uid: result.localId || result.user?.localId,
    baru: Boolean(result.isNewUser),
    user: result.user,
  };
}

export async function pro(
  id: string
): Promise<{ ok: boolean; order?: string; r?: any; why?: string }> {
  const result = await defaultAuthInstance.applyPremium(id);
  if (!result.success) {
    return {
      ok: false,
      why: result.error || 'Server aktivasi tidak mengonfirmasi bahwa Premium aktif.',
      r: result.data,
      order: result.orderId,
    };
  }

  return {
    ok: true,
    order: result.orderId || result.codeorder,
    r: result.data,
  };
}

export async function re(
  ref: string
): Promise<{ ok: boolean; id?: string; ref?: string; why?: string }> {
  try {
    const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: ref,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || 'Gagal refresh token');
    }
    return { ok: true, id: data.id_token, ref: data.refresh_token };
  } catch (e: any) {
    return { ok: false, why: e.message };
  }
}
