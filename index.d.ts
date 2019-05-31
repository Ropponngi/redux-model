import { AxiosError, AxiosRequestConfig, AxiosResponse, Canceler } from 'axios';
import { Dispatch, Middleware, MiddlewareAPI, Reducer } from 'redux';

interface Action<T = any> {
  type: T;
}

type AnyFunctionReturnType<T> = T extends (...args: any) => infer R ? R : never;

export type EnhanceState<T> = {
  [key in keyof T]: AnyFunctionReturnType<T[key]>;
};

export declare enum METHOD {
  get = "GET",
  post = "POST",
  put = "PUT",
  delete = "DELETE",
  head = "HEAD",
  patch = "PATCH"
}

export declare enum HTTP_STATUS_CODE {
  ok = 200,
  created = 201,
  accepted = 202,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  unProcessableEntity = 422,
  serviceError = 500,
  badGateWay = 502,
  serviceUnavailable = 503
}

export declare abstract class Model<Data> {
  private static COUNTER;
  protected readonly successType: string;
  private readonly instanceCounter;

  constructor(name?: string);

  getSuccessType(): string;

  createData(): (state: Data | undefined, action: any) => Data;

  protected getEffects(): RM.ReducerEffects<Data>;

  protected getTypePrefix(): string;

  protected abstract getInitValue(): Data;

  protected abstract onSuccess(state: Data, action: any): Data;
}

export declare abstract class ReducerModel<Data = {}> extends Model<Data> {
  protected onSuccess(): Data & RM.DoNotUseReducer;
}

export declare abstract class NormalModel<Data = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  constructor(name?: string);

  abstract action(...args: any[]): RM.NormalAction<Payload>;

  dispatch(dispatch: Dispatch, action: RM.NormalAction<Payload>): RM.NormalAction<Payload>;

  protected createAction(payload: Payload): RM.NormalAction<Payload>;

  protected abstract onSuccess(state: Data, action: RM.NormalAction<Payload>): Data;
}

export declare abstract class NormalActionModel<Payload extends RM.AnyObject = {}> extends NormalModel<RM.DoNotUseReducer, Payload> {
  protected getInitValue(): RM.DoNotUseReducer;

  protected onSuccess(): RM.DoNotUseReducer;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type CreateActionOption<Payload = RM.AnyObject> = Partial<Omit<RM.RequestAction<Payload>, 'type' | 'middleware' | 'uri' | 'method'>>;

export declare abstract class RequestModel<Data = {}, Response = {}, Payload extends RM.AnyObject = {}> extends Model<Data> {
  protected readonly prepareType: string;
  protected readonly failType: string;

  constructor(name?: string);

  getPrepareType(): string;

  getFailType(): string;

  createMeta(): (state: RM.ReducerMeta | undefined, action: RM.ResponseAction) => RM.ReducerMeta;

  createMetas(payloadKey: string): (state: RM.ReducerMetas | undefined, action: RM.ResponseAction<{}, Payload>) => RM.ReducerMetas;

  dispatch(dispatch: Dispatch, action: RM.MiddlewareEffect<Response, Payload>): RM.MiddlewareEffect<Response, Payload>;

  abstract action(...args: any[]): RM.MiddlewareEffect<Response, Payload>;

  protected get(uri: string, options?: CreateActionOption<Payload>): RM.MiddlewareEffect<Response, Payload>;

  protected post(uri: string, options?: CreateActionOption<Payload>): RM.MiddlewareEffect<Response, Payload>;

  protected put(uri: string, options?: CreateActionOption<Payload>): RM.MiddlewareEffect<Response, Payload>;

  protected patch(uri: string, options?: CreateActionOption<Payload>): RM.MiddlewareEffect<Response, Payload>;

  protected delete(uri: string, options?: CreateActionOption<Payload>): RM.MiddlewareEffect<Response, Payload>;

  protected abstract onSuccess(state: Data, action: RM.ResponseAction<Response, Payload>): Data;

  protected abstract getMiddlewareName(): string;

  private createAction;
}

export declare abstract class SocketModel<Payload extends RM.AnyObject = {}> extends NormalModel<RM.DoNotUseReducer, Payload> {
  dispatch(dispatch: Dispatch, action: RM.SocketAction<Payload>): RM.SocketAction<Payload>;

  abstract action(...args: any[]): RM.SocketAction<Payload>;

  protected createAction(payload: Payload): RM.SocketAction<Payload>;

  protected getInitValue(): RM.DoNotUseReducer;

  protected onSuccess(): RM.DoNotUseReducer;

  protected abstract getMiddlewareName(): string;
}

interface FailTransform {
  httpStatus?: HTTP_STATUS_CODE;
  errorMessage?: string;
  businessCode?: string;
}

export declare const createRequestMiddleware: <State extends RM.AnyObject>(config: {
  id: string;
  baseUrl: string;
  axiosConfig?: AxiosRequestConfig | undefined;
  onInit?: ((api: MiddlewareAPI<Dispatch, State>, action: RM.RequestAction<RM.AnyObject, RM.RequestTypes>) => void) | undefined;
  getHeaders: (api: MiddlewareAPI<Dispatch, State>) => RM.AnyObject;
  onFail: (error: RM.HttpError, transform: FailTransform) => void;
  onShowSuccess: (message: string) => void;
  onShowError: (message: string) => void;
}) => Middleware<{}, State, Dispatch>;

declare global {
  namespace RM {
    interface AnyObject {
      [key: string]: any;
    }

    interface DoNotUseReducer {
      do_not_use_reducer: true;
    }

    type ReducerEffects<Data> = Array<{
      when: string;
      effect: (state: Data, action: any) => Data;
    }>;

    interface ReducerMeta {
      actionType: string;
      loading: boolean;
      errorMessage?: string;
      httpStatus?: number;
      businessCode?: string | number;
    }

    type ReducerMetas = Partial<{
      [key: string]: RM.ReducerMeta;
    }>;

    interface RequestTypes {
      prepare: string;
      success: string;
      fail: string;
    }

    interface MiddlewareEffect<Response = {}, Payload = {}> {
      promise: Promise<RM.ResponseAction<Response, Payload>>;
      cancel: Canceler;
    }

    interface HttpError<T = any> extends AxiosError {
      response: AxiosResponse<T>;
    }

    interface NormalAction<Payload = RM.AnyObject, Type = string> extends Action<Type> {
      payload: Payload;
    }

    interface SocketAction<Payload = RM.AnyObject, Type = string> extends RM.NormalAction<Payload, Type> {
      middleware: string;
    }

    interface RequestAction<Payload = RM.AnyObject, Type = RequestTypes> extends RM.NormalAction<Payload, Type> {
      middleware: string;
      method: METHOD;
      uri: string;
      requestOptions: AxiosRequestConfig;
      body: RM.AnyObject;
      // queryString
      query: RM.AnyObject;
      successText: string;
      hideError: boolean | ((response: RM.ResponseAction<any>) => boolean);
    }

    interface ResponseAction<Response = {}, Payload = RM.AnyObject> extends RM.RequestAction<Payload, string> {
      response: Response;
      errorMessage?: string;
      httpStatus?: HTTP_STATUS_CODE;
      businessCode?: string;
    }
  }
}