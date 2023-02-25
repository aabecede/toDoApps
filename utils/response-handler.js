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
}) {
    baseResponse({
        response,
        data,
        status: 'Success',
        message: 'Success',
        statusCode: 200
    })
}

const res400Json = function ({
    response,
    data = {},
    message
}) {
    baseResponse({
        response,
        data,
        status: 'Request Invalid',
        message,
        statusCode: 400
    })
}
const res500Json = function ({
    response,
    data = {},
    message = 'Terjadi Kesalahab Server'
}) {
    baseResponse({
        response,
        status: 'Error',
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