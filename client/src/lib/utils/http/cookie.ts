import { ListenerAware } from '@slink/lib/listener';
import type { Cookies, Handle } from '@sveltejs/kit';

import { browser } from '$app/environment';

interface CookieProvider {
  get: (key: string, defaultValue?: string) => string;
  set: (key: string, value: string, ttl?: number) => void;
  remove: (key: string) => void;
}

class BrowserCookieProvider implements CookieProvider {
  get(key: string, defaultValue: string = ''): string {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? match[2] : defaultValue;
  }

  set(key: string, value: string, ttl?: number): void {
    if (!ttl) {
      document.cookie = `${key}=${value};path=/;Secure;SameSite=Strict`;
      return;
    }

    const date = new Date();
    date.setTime(date.getTime() + ttl * 1000);
    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/;Secure;SameSite=Strict`;
  }

  remove(key: string): void {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  }
}

class ServerCookieProvider implements CookieProvider {
  private _cookies: Cookies;
  constructor(cookies: Cookies) {
    this._cookies = cookies;
  }

  get(key: string, defaultValue: string = ''): string {
    return this._cookies.get(key) || defaultValue;
  }
  set(key: string, value: string, ttl?: number): void {
    console.log('set', key, value, ttl);
    this._cookies.set(key, value, {
      maxAge: ttl,
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });
  }

  remove(key: string): void {
    this._cookies.delete(key, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });
  }
}

class Cookie extends ListenerAware {
  private _providers: {
    [key: string]: CookieProvider;
  } = {
    browser: new BrowserCookieProvider(),
  };

  static create(): Cookie {
    return new Cookie();
  }

  setServerCookies(cookies: Cookies) {
    this._providers.server = new ServerCookieProvider(cookies);
  }

  get(key: string, defaultValue?: string): string {
    if (browser) {
      return this._providers.browser.get(key, defaultValue);
    }
    return this._providers?.server.get(key, defaultValue) || defaultValue || '';
  }

  set(key: string, value: string, ttl?: number): void {
    if (browser) {
      this._providers.browser.set(key, value, ttl);
    } else {
      this._providers?.server.set(key, value, ttl);
    }

    this._listener.notify(key, value);
  }

  remove(key: string): void {
    if (browser) {
      this._providers.browser.remove(key);
    } else {
      this._providers?.server.remove(key);
    }
  }
}

export const cookie = Cookie.create();
export const setServerCookiesHandle: Handle = async ({ event, resolve }) => {
  cookie.setServerCookies(event.cookies || []);
  return resolve(event);
};