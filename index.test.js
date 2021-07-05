const { toYodaSpeak } = require('./index')

test('Can do odd word count', () => {
    expect(toYodaSpeak('The man ate a creamcake')).toBe('A creamcake the man ate');
})

test('Can do even word count', () => {
    expect(toYodaSpeak('I am a cat')).toBe('A cat i am');
});