import { produce } from 'mokapi/kafka'

export default function() {
    produce({
        topic: 'user.created',
        messages: [
            {
                data: {
                    id: '1234',
                    name: 'Bob',
                    email: 'bob@example.com'
                }
            }
        ]
    })
}