import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import * as dateFns from 'date-fns';
import Config, { AI_MODEL } from '../config';
import logger from '../config/log';
import { GeneratedTask, TaskCreate, TaskSummary } from '../types';

const configuration = new Configuration({
    apiKey: Config.openAiApiKey,
});

export const openai = new OpenAIApi(configuration);

export const generateTasksFromTextInput = async (input: string): Promise<Partial<TaskCreate>[]> => {
    try {
        const messages: ChatCompletionRequestMessage[] = [
            {
                role: 'system',
                content: `
                   I want to you to analyze the tasks given to you as a natural language and input out the tasks in the model below
                   { 
                        "title": "Title of the task",
                         "description": "extra description of the task", 
                         "time": "time mentioned in the prompt",
                         "summary": "human friendly notification that describes the task when it is time to accomplish it."
                   } as array.
                   If the user does not provide time like 8 am or 9 pm. You can use your own time that suits the time based on the text,
                   for example, 8 am for morning, 2pm for afternoon and 9pm for evening. But feel free to use your initiative based on the
                   context of the input. Meanwhile time should be in format "yyyy-MM-DD HH:mm:ss". Use current date if date is not provided. 
                   Current date is ${dateFns.format(new Date(), 'yyyy-MM-ddTHH:mm:ss')}.
                   The summary should be human friendly message that describes the task title and description, it is meant to be a reminder message.
                   For example, It's almost time to play football. Do not use the example, task title and description directly.
                   Generate your own message from them and make sure important information from the title and description are mentioned for context.
                   If the text input is invalid or no tasks can be extracted from it. Return an empty array.
                `,
            },
        ];

        messages.push({ role: 'user', content: input });

        // Call the API with user input & history
        const completion = await openai.createChatCompletion({
            model: AI_MODEL,
            messages,
        });

        const data: GeneratedTask[] = JSON.parse(completion.data.choices[0].message.content);

        return data.map((task) => {
            return {
                title: task.title,
                description: task.description,
                time: dateFns.format(new Date(task.time), 'yyyy-MM-dd HH:mm:ss'),
                summary: task.summary,
            };
        });
    } catch (err) {
        logger.error(err, '[GenerateTasksFromTextInput]');
    }
};
export const generateNotificationSummaryFromTask = async (input: Partial<TaskCreate>): Promise<TaskSummary> => {
    try {
        const messages: ChatCompletionRequestMessage[] = [
            {
                role: 'system',
                content: `
                   I want to you to analyze the task given to you as a natural language and input out the summary of the task in the model below
                   { 
                     "summary": "human friendly notification that describes the task when it is time to accomplish it."
                   }.
                   The summary should be human friendly message that describes the task title and description, it is meant to be a reminder message.
                   For example, It's almost time to play football. Do not use the example, task title and description directly. 
                   Generate your own message from them and make sure important information from the title and description are mentioned for context.
                   Return the summary as  { "summary": "the value you generated" }
                   If the input is invalid or no tasks can be extracted from it. Return { "summary": "" }.
                `,
            },
        ];

        messages.push({ role: 'user', content: JSON.stringify(input) });

        // Call the API with user input & history
        const completion = await openai.createChatCompletion({
            model: AI_MODEL,
            messages,
        });

        return JSON.parse(completion.data.choices[0].message.content);
    } catch (err) {
        logger.error(err, '[generateNotificationsFromTask]');
    }
};
