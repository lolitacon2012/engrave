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

  private _handleError = (error: any) => Promise.reject(error);

  public callRPC = async (data: {
    rpc: string, data: any
  }, uniqueRequestId?: string, onNewResultReceived?: (newResult: any) => void) => {
    if (uniqueRequestId) {
      const parsedResult = JSON.parse(localStorage.getItem(`_request_cahce_${uniqueRequestId}`) || 'null');
      if (!parsedResult) {
        const result = await axios.post('/api/rpc', data);
        localStorage.setItem(`_request_cahce_${uniqueRequestId}`, JSON.stringify({ data: result.data }));
        onNewResultReceived && onNewResultReceived(result.data);
        return result.data;
      } else {
        axios.post('/api/rpc', data).then((result) => {
          uniqueRequestId && localStorage.setItem(`_request_cahce_${uniqueRequestId}`, JSON.stringify({ data: result.data }));
          onNewResultReceived && onNewResultReceived(result.data);
        })
        return parsedResult.data;
      }

    } else {
      const result = await axios.post('/api/rpc', data);
      return result.data;
    }
  }
}

const client = new HttpClient();

export default client;