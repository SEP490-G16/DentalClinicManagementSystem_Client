import {ToastrService} from "ngx-toastr";

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
            this.unAuthoried();
            break;
          case HttpStatus.Forbidden: //Hiển thị pop-up: Bạn không có quyền truy cập và trả về trang trước
            this.forBidden();
            break;
          case HttpStatus.ServerError:  //Hiển thị pop-up: Trang web hiện đang bảo trì
            this.serverError();
            break;
          /*case HttpStatus.Conflict: // Hiển thị pop-up:
            break;*/
          case HttpStatus.BadRequest:  //Hiển thị pop-up: Kiểm tra lại đầu vào
            this.badRequest();
            break;
        }
        return "";
      }
      private static toastr: ToastrService
      static badRequest(){
        this.toastr.error('Lỗi 401','Kiểm tra lại đầu vào!');
      }
      static serverError(){
        this.toastr.error('Lỗi 500','Trang web hiện đang bảo trì!');
      }
      static forBidden(){
        this.toastr.error('Lỗi 403','Bạn không có quyền truy cập!');
      }
      static unAuthoried(){
        window.location.href = '/dangnhap';
      }
}
