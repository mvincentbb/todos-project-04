import { TodosAccess } from '../dataLayer/todosAccess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoUpdate } from '../models/TodoUpdate';
import { createLogger } from '../utils/logger';
import { v4 as uuid } from 'uuid';

const logger = createLogger('TodosAccess');
const attachmentUtils = new AttachmentUtils();
const todosAccess = new TodosAccess();

//function to get all the todos corresponding to a user
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todos based on user');
    return todosAccess.getAllTodos(userId);
}
//function to create a new todo
export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info('Create new todo item');
    const todoId = uuid();
    const createdAt = new Date().toISOString();
    const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId);
    const item: TodoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl,
        ...newTodo,
    };
    return await todosAccess.createTodoItem(item);
}

//function to update a todo
export async function updateTodo(
    userId: string,
    todoId: string,
    todoUpdate: UpdateTodoRequest
): Promise<TodoUpdate> {
    logger.info('Update todo');
    return await todosAccess.updateTodoItem(userId, todoId, todoUpdate);
}

//function to update the attachment url
export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<string> {
    logger.info('Delete todo');
    return todosAccess.deleteTodoItem(todoId, userId);
}

//function to creat an attachment url
export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
): Promise<string> {
    logger.info('Create  a new presigned URL attachment', todoId, userId);
    return attachmentUtils.getUploadUrl(todoId);
}