function parallel(entries) {
    const thread = process.env.CUCUMBER_WORKER_ID ?? 0;
    const value = entries[thread];
    if (value === undefined) {
        throw new Error(`Value for thread ${thread} is undefined!\nMake sure you have provided values for each thread.`)
    }
    return value;
}

module.exports = {
    parallel
};
