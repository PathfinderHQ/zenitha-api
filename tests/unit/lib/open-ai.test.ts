import { generateRandomString, generateTasksFromTextInput, openai } from '../../../src/lib';
import logger from '../../../src/config/log';
import { chatCompletionErrorResult, chatCompletionSuccessResult } from '../../utils';

describe.skip('Open AI', () => {
    it('should generate task', async () => {
        const input = generateRandomString();

        // spy on openai
        jest.spyOn(openai, 'createChatCompletion').mockResolvedValue(chatCompletionSuccessResult as any);

        const result = await generateTasksFromTextInput(input);

        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: 'Visit Grandma',
                    description: 'I wish to visit my grandma',
                    time: '2023-06-30 14:00:00',
                }),
            ])
        );
    });

    it('should throw error', async () => {
        const input = generateRandomString();

        // spy on openai
        jest.spyOn(openai, 'createChatCompletion').mockRejectedValue(chatCompletionErrorResult as any);

        const logSpy = jest.spyOn(logger, 'error');

        await generateTasksFromTextInput(input);

        expect(logSpy).toHaveBeenCalled();
    });
});
