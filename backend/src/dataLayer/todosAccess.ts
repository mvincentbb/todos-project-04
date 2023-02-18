import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

var AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodosAccess{
    constructor(
        private readonly documentClient: DocumentClient  = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable: string = process.env.TODOS_TABLE,
        private readonly todoIndex: string = process.env.INDEX_NAME
    ) {}
    //get all the todos
    async getAllTodos(userId: string): Promise<TodoItem[]>{
        logger.info('Get all the todo')

        const result = await this.documentClient.query({

            TableName: this.todoTable,
            IndexName: this.todoIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId': userId
            }
        }).promise()
        const todos = result.Items
        return todos as TodoItem[]
    }
    //create a new todo
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem>{
        logger.info("Create a new todo element")
        const newTodoItem = await this.documentClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()
        logger.info('A new todo item was successfully created', newTodoItem)
        return todoItem as TodoItem
    }

    async updateTodoAttachementUrl(
        todoId: string,
        userId: string,
        attachementUrl: string) : Promise<void> {
        logger.info("update the attachment url")

        await this.documentClient
            .update({
            TableName: this.todoTable,
            Key:{
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :attachementUrl',
            ExpressionAttributeValues:{
                ':attachmentUrl' : attachementUrl
            }
        }).promise()
    }

    async updateTodoItem(
        userId: string,
        todoId: string,
        todoUpdate: TodoUpdate
    ):Promise<TodoUpdate>{
        const result = await this.documentClient
            .update({
                TableName: this.todoTable,
                Key:{
                    todoId,
                    userId
                },
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':name': todoUpdate.name,
                    ':dueDate': todoUpdate.dueDate,
                    ':done': todoUpdate.done,
                },
                ExpressionAttributeNames:{
                    '#name':'name',
                },
                ReturnValues:'ALL_NEW'
            }).promise()
        const todoItemUpdate = result.Attributes
        logger.info('Todo item is successfully updated', todoItemUpdate)
        return todoItemUpdate as TodoUpdate
    }

    async deleteTodoItem(todoId:string, userId:string):Promise<string>{
        logger.info('Delete a todo item')
        const result = await this.documentClient.delete({
            TableName: this.todoTable,
            Key:{
                todoId,
                userId
            }
        }).promise()
        logger.info("todo item deleted", result)
        return todoId as string
    }

}