export class Utils {
  public static successResponse(message: string, body: any) {
    return {
      status: 200,
      message: message,
      result: body,
    };
  }

  public static errorResponse(statusCode: number, message: string) {
    return {
      status: statusCode,
      message: message,
    };
  }
}
