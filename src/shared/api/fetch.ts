import { attach, createEffect, createStore, sample } from "effector";

export const $token = createStore<string | null>(null);

export type FilesData = { files?: File[] };
export type ReqData = Record<string, any> & FilesData;
export type BaseRequest = {
  path: string;
  query?: Record<string, any>;
  data?: ReqData;
  method: string;
  hasFiles?: boolean;
  stream?: boolean;
  url?: string;
  isPublic?: boolean;
  token?: string;
};

export type ErrorRes = {
  message: string;
  info: string;
  status: number;
};

export type FetchSettings = RequestInit & { path?: string; data?: ReqData };

export const requestFx = createEffect<BaseRequest, unknown, ErrorRes>(
  async ({ url, path, query, data, method, stream = false, isPublic, token }) => {
    const hasFiles = data ? data.hasOwnProperty("files") : false;
    const controller = new AbortController();

    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let fetchSettings: FetchSettings = {
      method,
      signal: controller.signal,
      headers: {},
    };
    if (!isPublic) {
      fetchSettings.credentials = "include";
      fetchSettings = {
        ...fetchSettings,
        headers: {
          ...fetchSettings.headers,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL,
        },
      };
      if (token) {
        fetchSettings = {
          ...fetchSettings,
          headers: {
            ...fetchSettings.headers,
            Authorization: `Bearer ${token}`,
          },
        };
      }
    }

    if (data) {
      if (hasFiles) {
        const { files, ...fields } = data;
        const formData = new FormData();
        if (!!fields) {
          for (const name in fields) {
            formData.append(name, fields[name]);
          }
        }
        if (files) {
          files.forEach((file: File) => {
            formData.append("files", file, file.name);
          });
          fetchSettings.body = formData;
        }
      } else {
        fetchSettings.body = JSON.stringify(data);
      }
    }
    if (!hasFiles) {
      // @ts-expect-error wtf
      fetchSettings.headers["Content-Type"] = "application/json";
    }
    const baseUrl = url || `${import.meta.env.PUBLIC_ENV__BASE_PROTOCOL}://${import.meta.env.PUBLIC_ENV__BASE_URL}`;
    const res = await fetch(`${baseUrl}${path}${queryToString(query)}`, fetchSettings);
    if (stream) {
      let chunks = "";

      const reader = res.body!.getReader();
      const { done, value } = await reader.read();

      if (done) {
        return chunks;
      }

      chunks += new TextDecoder().decode(value);
    } else {
      const result = await res.json();

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw {
          message: result.error || "",
          //  info: result.additionalInfo || '',
          status: res.status,
        } as ErrorRes;
      }

      return result;
    }
  },
);

export function queryToString(query: Record<string, any> | undefined): string {
  if (!query) return "";
  const params = new URLSearchParams(query);
  return `?${params.toString()}`;
}

export const backendRequestFx = attach({
  effect: requestFx,
  source: $token,
  //@ts-expect-error
  mapParams: (data, token) => ({ ...data, token }),
});

backendRequestFx.finally.watch((v) => console.log("Backend request", v));
