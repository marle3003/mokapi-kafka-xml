import { Kafka } from 'kafkajs';
import { parseStringPromise } from 'xml2js';

const kafka = new Kafka({
  clientId: 'transformer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'transformer-group' });
const producer = kafka.producer();

async function start() {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'user.created', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const xml = message.value.toString();
      console.log('received user:', xml);

      const { user } = await parseStringPromise(xml, { mergeAttrs: true, explicitArray: false });
      console.log(user)
      const value = JSON.stringify({ id: user.id, name: user.name, email: user.emailAddress})
      console.log(value)

      await producer.send({
        topic: 'user.transformed',
        messages: [{ key: user.id, value: value }]
      });

      console.log('published user:', user);
    }
  });
}

start().catch(console.error);