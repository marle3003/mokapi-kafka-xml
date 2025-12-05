import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';

const MOKAPI_API = 'http://localhost:8080/api/services/kafka/Kafka%20XML%20Example';
const TOPIC_XML = 'user.created';
const TOPIC_JSON = 'user.transformed';

test('Kafka XML transform workflow', async () => {
    const userId = 'user-' + Date.now();
    let startOffset = -1
    await test.step(`Get current offset for ${TOPIC_JSON}`, async () => {
        startOffset = await getPartitionOffset(TOPIC_JSON, 0)
        console.log('current partition offset is: ' + startOffset)
    })

    await test.step(`Produce a message to ${TOPIC_XML} topic`, async () => {
        await produce(TOPIC_XML, {
            key: userId,
            value: {
                id: userId,
                name: 'Bob',
                email: 'bob@example.com'
            }
        })
    })

    await test.step(`Get messages from ${TOPIC_JSON}`, async () => {
        let record: any = undefined;
        const timeout = Date.now() + 5000;

        while (Date.now() < timeout && !record) {
            const records: any = await read(TOPIC_JSON, 0, startOffset);
            console.log(records)
            record = records.find((x: any) => x.key === userId);
            if (record) {
                break    
            }
            startOffset += records.length
            // short delay before retry
            await new Promise(res => setTimeout(res, 200));
        }
        expect(record, 'record should be found').not.toBeNull();
        expect(record.value).toStrictEqual({
            id: userId,
            name: 'Bob',
            email: 'bob@example.com'
        })
    })
})

async function getPartitionOffset(topic: string, partition: number) {
  const res = await fetch(`${MOKAPI_API}/topics/${topic}/partitions/${partition}`);
  const data: any = await res.json();
  return data.offset
}

async function produce(topic: string, record: {key: string, value: any}) {
    const res = await fetch(`${MOKAPI_API}/topics/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            records: [
                {
                    key: record.key,
                    value: record.value
                }
            ]
        })
    });
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.offsets.every((x: any) => !('error' in x))).toBe(true);
}

async function read(topic: string, partition: number, offset: number) {
    const res = await fetch(`${MOKAPI_API}/topics/${topic}/partitions/${partition}/offsets?offset=${offset}`,
        {
            headers: { Accept: 'application/json' }
        }
    )
    expect(res.status).toBe(200);
    return await res.json()
}