function initMya() {
    const initListeners = [];
    window.mya = function mya(listener) {
        initListeners.push(listener);
    };
    const client = mqtt.connect();

    const mya = {
        subscribe(topic, listener) {
            if (topic.includes('+') || topic.includes('#'))
                throw new Error('Wildcards not supported yet');
        },
    };

    client.on('connect', () => initListeners.forEach(listener => listener(mya)));
}
