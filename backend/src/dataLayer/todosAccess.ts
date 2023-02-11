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

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem>{
        logger.info("Create a new todo element")
        const newTodoItem = await this.documentClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()
        logger.info('A new todo item was successfully created', newTodoItem)
        return todoItem as TodoItem
    }



}