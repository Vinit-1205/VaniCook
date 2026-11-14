export class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = 200, meta = null) {
    const response = {
      success: true,
      message,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return res.status(statusCode).json(response);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, message, data, 201);
  }

  static error(res, message = 'An error occurred', statusCode = 500, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || (statusCode === 500 ? 'Internal server error' : message),
    });
  }
}

