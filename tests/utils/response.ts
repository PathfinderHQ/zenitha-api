export default class Response {
    statusCode: number;

    status(status: number) {
        this.statusCode = status;

        return this;
    }

    json(data: Record<string, unknown>) {
        return data;
    }
}
