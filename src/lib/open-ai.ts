import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from 'openai';
import * as dateFns from 'date-fns';
import Config, { AI_MODEL } from '../config';
import logger from '../config/log';
import { GeneratedTask, TaskCreate } from '../types';

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
                   { "title": "Title of the task", "description": "extra description of the task", time: "time mentioned in the prompt" } as array.
                   If the user does not provide time like 8 am or 9 pm. You can use your own time that suits the time based on the text,
                   for example, 8 am for morning, 2pm for afternoon and 9pm for evening. But feel free to use your initiative based on the
                   context of the input. Meanwhile time should be in format yyyy-MM-DD HH:mm:ss. Use current date if date is not provided. 
                   Current date is ${dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.
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

        return data.map((task) => ({
            ...task,
            time: dateFns.format(new Date(task.time), 'yyyy-MM-dd HH:mm:ss'),
        }));
    } catch (err) {
        logger.error(err, '[GenerateTasksFromTextInput]');
    }
};
