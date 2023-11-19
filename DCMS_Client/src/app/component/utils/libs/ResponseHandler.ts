enum HttpStatus {
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    ServerError = 500,
    Forbidden = 403,
    NotAllowMethod = 405,
    RequestTimeOut = 408,
    Conflict = 409, 
    TooManyRequests = 429,
    BadGateWay = 502,
    GatewayTimeOut = 504
}
export class ResponseHandler {
    static HANDLE_HTTP_STATUS(url: string, error: any): any {
        switch(error.status) {
            case HttpStatus.Unauthorized: 
                window.location.href='/dangnhap';
            break;
        }
        return "";
      }
}