import { Request, Response, Router, Server } from '../types';
import { middleware } from './middlewares';
import { errorResponse, serverErrorResponse, successResponse, validateSchema } from '../lib';
import { HttpStatusCode } from '../config';
import { createTaskSchema, updateTaskSchema } from '../validations';

export const taskHTTPService = (server: Server) => {
    const { isAuthenticatedUser } = middleware(server);
    const registerTaskRoutes = (router: Router) => {
        router.post('/tasks', isAuthenticatedUser, createTask);
        router.get('/tasks/:id', isAuthenticatedUser, getTask);
        router.put('/tasks/:id', isAuthenticatedUser, updateTask);
        router.delete('/tasks/:id', isAuthenticatedUser, deleteTask);
        router.get('/tasks', isAuthenticatedUser, listTasks);
    };

    const createTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(createTaskSchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            if (value.category) {
                const foundCategory = await server.categoryService.get({ id: value.category });

                if (!foundCategory) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid category');
            }

            const task = await server.taskService.create({ ...value, user: req.user.id });

            return successResponse(res, HttpStatusCode.CREATED, 'Task created', task);
        } catch (err) {
            return serverErrorResponse(res, 'CreateTask', err);
        }
    };

    const listTasks = async (req: Request, res: Response): Promise<Response> => {
        try {
            const tasks = await server.taskService.list({ ...req.query, user: req.user.id });

            return successResponse(res, HttpStatusCode.OK, 'Tasks retrieved', tasks);
        } catch (err) {
            return serverErrorResponse(res, 'ListTasks', err);
        }
    };

    const getTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const task = await server.taskService.get({ id: req.params.id, user: req.user.id });

            if (!task) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Task not found');

            return successResponse(res, HttpStatusCode.OK, 'Task retrieved', task);
        } catch (err) {
            return serverErrorResponse(res, 'GetTask', err);
        }
    };

    const updateTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(updateTaskSchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            if (value.category) {
                const foundCategory = await server.categoryService.get({ id: value.category });

                if (!foundCategory) return errorResponse(res, HttpStatusCode.BAD_REQUEST, 'Invalid category');
            }

            const updatedTask = await server.taskService.update({ id: req.params.id, user: req.user.id }, value);

            if (!updatedTask) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Task not found');

            return successResponse(res, HttpStatusCode.OK, 'Task updated', updatedTask);
        } catch (err) {
            return serverErrorResponse(res, 'UpdateTask', err);
        }
    };

    const deleteTask = async (req: Request, res: Response): Promise<Response> => {
        try {
            const task = await server.taskService.get({ id: req.params.id, user: req.user.id });

            if (!task) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Task not found');

            // delete the task
            await server.taskService.remove({ id: req.params.id, user: req.user.id });

            return successResponse(res, HttpStatusCode.OK, 'Task deleted');
        } catch (err) {
            return serverErrorResponse(res, 'DeleteTask', err);
        }
    };

    return { registerTaskRoutes };
};
