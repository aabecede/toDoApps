const baseResponse = function (
    {
        response, //required,
        data = [],
        status = 'Success',
        message = 'Success',
        statusCode = 200
    }) {
    data['status'] = status
    data['message'] = message
    response.status(statusCode).json(data);
    response.end();
}
const res200Json = function ({
    response,
    data,
    statusCode = 200,
    status = 'Success',
    message = 'Success',
}) {
    baseResponse({
        response,
        data,
        status,
        message,
        statusCode
    })
}

const res400Json = function ({
    response,
    data = {},
    message = 'Invalid Request',
    statusCode = 400,
    status = 'Request Invalid',
}) {
    baseResponse({
        response,
        data,
        status,
        message,
        statusCode
    })
}
const res500Json = function ({
    response,
    data = {},
    message = 'Terjadi Kesalahab Server',
    status = 'Error',
}) {
    baseResponse({
        response,
        status,
        data,
        message,
        statusCode: 500
    })
}

module.exports = {
    res200Json,
    res400Json,
    res500Json
};