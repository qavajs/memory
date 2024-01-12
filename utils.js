function parallel(entries, options = {}) {
    const totalWorkers = parseInt(process.env.CUCUMBER_TOTAL_WORKERS ?? 1);
    const workerId = parseInt(process.env.CUCUMBER_WORKER_ID ?? 0);
    const shard = parseInt(process.env.SHARD ?? 0) - 1;
    const thread = options.shard
        ? workerId + shard * totalWorkers
        : workerId;
    const value = entries[thread];
    if (value === undefined) {
        throw new Error(`Value for thread ${thread} is undefined!\nMake sure you have provided values for each thread.`)
    }
    return value;
}

module.exports = {
    parallel
};
