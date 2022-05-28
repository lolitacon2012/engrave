import axios, { AxiosInstance, AxiosResponse } from 'axios';

class HttpClient {
  private instance: AxiosInstance;
  public constructor() {
    this.instance = axios.create();
    this._initializeResponseInterceptor();
  }

  private _initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError,
    );
  };

  private _handleResponse = ({ data }: AxiosResponse) => data;

  private _handleError = (error: any) => {
    Promise.reject(error)
  };

  private _handleRpcErrorMessage = (error: string) => {
    // console.log(error)
  };

  public setRpcOnErrorMessage = (callback: (e: string) => void) => {
    this._handleRpcErrorMessage = (err: string) => (callback(err));
  }

  // callRPC that can do local cache
  // Todo: use indexDB
  public callRPC = async (data: {
    rpc: string, data: any
  }, uniqueRequestId?: string, onNewResultReceived?: (newResult: {
    error: string, data?: any
  }) => void): Promise<{
    error: string, data?: any
  }> => {
    if (uniqueRequestId) {
      const parsedResult = JSON.parse(localStorage.getItem(`${uniqueRequestId}`) || 'null');
      if (!parsedResult) {
        const result = await axios.post('/api/rpc', data);
        const hasError = result.status !== 200 || result.data?.error;
        result.data?.error && this._handleRpcErrorMessage(result.data?.error);
        try {
          !hasError && localStorage.setItem(`${uniqueRequestId}`, JSON.stringify({ data: result.data }));
        } catch {
          localStorage.clear();
          // TODO: use memory
        }
        hasError && localStorage.setItem(`${uniqueRequestId}`, '');
        onNewResultReceived && onNewResultReceived(result.data);
        return result.data;
      } else {
        axios.post('/api/rpc', data).then((result) => {
          const hasError = result.status !== 200 || result.data?.error;
          result.data?.error && this._handleRpcErrorMessage(result.data?.error);
          try {
            !hasError && uniqueRequestId && localStorage.setItem(`${uniqueRequestId}`, JSON.stringify({ data: result.data }));
            hasError && localStorage.setItem(`${uniqueRequestId}`, '');
          } catch {
            // TODO: use memory
            localStorage.clear();
          }
          onNewResultReceived && onNewResultReceived(result.data);
        })
        return parsedResult.data;
      }

    } else {
      const result = await axios.post('/api/rpc', data);
      result.data?.error && this._handleRpcErrorMessage(result.data?.error);
      return result.data;
    }
  }
}

const client = new HttpClient();

export default client;