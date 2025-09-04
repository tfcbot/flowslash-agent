/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface WorkflowExecutionResponse {
  /** @example true */
  success: boolean;
  data: {
    /** Workflow execution status */
    status?: "completed" | "failed";
    /** Workflow execution result */
    result?: {
      currentOutput?: string;
      nodeResults?: Record<string, any>;
      executionLog?: string[];
    };
    /** Execution time in milliseconds */
    duration?: number;
    message?: string;
  };
  /** @format date-time */
  timestamp: string;
}

export interface ErrorResponse {
  /** @example false */
  success: boolean;
  /** Error type or category */
  error: string;
  /** Detailed error message */
  message?: string;
  /** @format date-time */
  timestamp: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:3000";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title FlowSlash Agent API
 * @version 1.0.0
 * @license MIT
 * @baseUrl http://localhost:3000
 * @contact FlowSlash Agent API (http://localhost:3000/docs)
 *
 * Stateless LangGraph microservice for AI-generated workflow execution with 15 curated tool integrations. Uses environment variables for API keys and bearer token authentication.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  health = {
    /**
     * @description Get API status and available endpoints
     *
     * @name HealthList
     * @summary API Health Check
     * @request GET:/health
     * @secure
     */
    healthList: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example true */
          success?: boolean;
          data?: {
            name?: string;
            version?: string;
            status?: string;
            endpoints?: object;
          };
          /** @format date-time */
          timestamp?: string;
        },
        any
      >({
        path: `/health`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  execute = {
    /**
     * @description Execute the embedded LangGraph workflow with user input. UserId extracted from bearer token or optionally provided in request body.
     *
     * @tags Workflow Execution
     * @name ExecuteCreate
     * @summary Execute AI-Generated Workflow
     * @request POST:/execute
     * @secure
     */
    executeCreate: (
      data: {
        /**
         * Input data for the workflow
         * @example {"message":"Send email to john@example.com about project completion"}
         */
        input: Record<string, any>;
        /**
         * Optional user ID override - if not provided, extracted from bearer token
         * @example "user123"
         */
        userId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<WorkflowExecutionResponse, ErrorResponse>({
        path: `/execute`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  api = {
    /**
     * @description Download generated TypeScript SDK as tar.gz archive - NO userId required
     *
     * @tags SDK, Public
     * @name SdkDownloadList
     * @summary Download TypeScript SDK
     * @request GET:/api/sdk/download
     * @secure
     */
    sdkDownloadList: (params: RequestParams = {}) =>
      this.request<File, ErrorResponse>({
        path: `/api/sdk/download`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description Get metadata about the generated TypeScript SDK - NO userId required
     *
     * @tags SDK, Public
     * @name SdkInfoList
     * @summary Get SDK information
     * @request GET:/api/sdk/info
     * @secure
     */
    sdkInfoList: (params: RequestParams = {}) =>
      this.request<
        {
          success?: boolean;
          data?: {
            sdk?: {
              /** @format date-time */
              generatedAt?: string;
              files?: string[];
              totalFiles?: number;
              installInstructions?: object;
              usage?: object;
            };
          };
        },
        any
      >({
        path: `/api/sdk/info`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  llmsTxt = {
    /**
     * @description Download endpoint list in LLMs.txt format for AI consumption - NO userId required
     *
     * @tags Documentation, Public
     * @name LlmsTxtList
     * @summary Get LLMs.txt file
     * @request GET:/llms.txt
     * @secure
     */
    llmsTxtList: (params: RequestParams = {}) =>
      this.request<string, string>({
        path: `/llms.txt`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}
