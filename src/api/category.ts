import { Request, Response, Router, Server } from '../types';
import { middleware } from './middlewares';
import { errorResponse, serverErrorResponse, successResponse, validateSchema } from '../lib';
import { HttpStatusCode } from '../config';
import { createCategorySchema, updateCategorySchema } from '../validations';

export const categoryHTTPService = (server: Server) => {
    const { isAuthenticatedUser } = middleware(server);
    const registerCategoryRoutes = (router: Router) => {
        router.post('/categories', isAuthenticatedUser, createCategory);
        router.get('/categories/:id', isAuthenticatedUser, getCategory);
        router.put('/categories/:id', isAuthenticatedUser, updateCategory);
        router.delete('/categories/:id', isAuthenticatedUser, deleteCategory);
        router.get('/categories', isAuthenticatedUser, listCategories);
    };

    const createCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(createCategorySchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            const category = await server.categoryService.create({ user: req.user.id, name: value.name });

            return successResponse(res, HttpStatusCode.CREATED, 'Category created', category);
        } catch (err) {
            return serverErrorResponse(res, 'CreateCategory', err);
        }
    };

    const getCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const category = await server.categoryService.get({ id: req.params.id });

            if (!category) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Category not found');

            return successResponse(res, HttpStatusCode.OK, 'Category retrieved', category);
        } catch (err) {
            return serverErrorResponse(res, 'GetCategory', err);
        }
    };

    const listCategories = async (req: Request, res: Response): Promise<Response> => {
        try {
            const categories = await server.categoryService.list({
                ...req.query,
                user_or_null: req.user.id,
            });

            return successResponse(res, HttpStatusCode.OK, 'Categories retrieved', categories);
        } catch (err) {
            return serverErrorResponse(res, 'ListCategories', err);
        }
    };

    const updateCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { error, value } = validateSchema(updateCategorySchema, req.body);

            if (error) return errorResponse(res, HttpStatusCode.BAD_REQUEST, error);

            const updatedCategory = await server.categoryService.update(
                {
                    id: req.params.id,
                    user: req.user.id,
                },
                value
            );

            if (!updatedCategory) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Category not found');

            return successResponse(res, HttpStatusCode.OK, 'Category updated', updatedCategory);
        } catch (err) {
            return serverErrorResponse(res, 'UpdateCategory', err);
        }
    };

    const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
        try {
            const category = await server.categoryService.get({
                id: req.params.id,
                user: req.user.id,
            });

            if (!category) return errorResponse(res, HttpStatusCode.NOT_FOUND, 'Category not found');

            // delete the category
            await server.categoryService.remove({
                id: req.params.id,
                user: req.user.id,
            });

            return successResponse(res, HttpStatusCode.OK, 'Category deleted');
        } catch (err) {
            return serverErrorResponse(res, 'DeleteCategory', err);
        }
    };

    return { registerCategoryRoutes };
};
