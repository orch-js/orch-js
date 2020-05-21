import { Observable, Observer } from 'rxjs'
import axios, { AxiosRequestConfig, AxiosError } from 'axios'

type RequestMethods = 'GET' | 'POST' | 'DELETE' | 'PUT'

function request<T>(url: string, options: AxiosRequestConfig): Observable<T> {
  return new Observable((observer: Observer<T>) => {
    const { cancelToken, ...restOptions } = options
    const source = axios.CancelToken.source()

    if (cancelToken) {
      cancelToken.promise.then((reason) => source.cancel(reason.message))
    }

    axios(url, { cancelToken: source.token, ...restOptions })
      .then(({ data }) => data)
      .then((result: T) => {
        observer.next(result)
        observer.complete()
      })
      .catch((error: AxiosError) => {
        if (axios.isCancel(error)) {
          observer.complete()
        } else {
          observer.error(error)
        }
      })

    return () => {
      source.cancel(`Request ${url} cancelled.`)
    }
  })
}

function requestFactory(method: RequestMethods) {
  return <T>(path: string, options: AxiosRequestConfig = {}): Observable<T> => {
    return request<T>(path, { ...options, method, baseURL: 'http://127.0.0.1:9001/' })
  }
}

export const rxAxios = {
  get: requestFactory('GET'),
}
