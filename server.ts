import express, { Request, Response } from 'express'
import cors from 'cors'
import axios from 'axios'
import { Line } from './Line.ts'
import { prisma } from './AppdataSource.ts'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

dayjs.locale('th')

import { Notify } from './generated/prisma/index'

const app = express()

app.use(express.json())
app.use(cors())

// Token Line OA
const token = 'Mmee8ZvGsFSEUawdJMvx7BS0nIu1szjvwNAB/8SpQj9gzhJZKmel8z6gdWL1Jooy3uv13i6cHHEfRzjeu32Dxg7vA/CRGyJ5AKJEReOMKS8w79kZ5up9li7DFWqpTF+6JEoRLAs0H9l6Qi5j7TGdAAdB04t89/1O/w1cDnyilFU='

const line = new Line(token)

const SendMessage = () => {
    return new Promise(async (resolve) => {

        let users: Notify[] = await prisma.notify.findMany()

        if (users && users.length > 0) {

            users.map((item: { id: number, uid: string }, index: number) => {
                line.push(`วันนี้อย่าลืมทานธาตุเหล็ก💊 และตามด้วยอาหารดีๆ เพื่อบำรุงแม่และลูกน้อยค่ะ🍽️🫄`, item.uid)
                // console.log("PUSH MESSAGE!")
                if (index + 1 == users.length) {
                    resolve("ok")
                }
            })

            console.log("Broadcast message successfully!")

        } else {
            console.log("No one users")
        }
    })
}

const Task = () => {

    let now = dayjs()

    let NextNineAM = now.hour(9).minute(0).second(0).millisecond(0)

    if (now.isAfter(NextNineAM)) {
        NextNineAM = NextNineAM.add(1, 'day')
    }

    console.log('Next 9AM:', NextNineAM.format())

    let diff = NextNineAM.diff(now)

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    console.log(hours, minutes, seconds)

    // console.log(diff)

    setTimeout(async () => {
        await SendMessage()
        Task()
    }, diff)

}

Task()

app.post("/webhook", async (req: Request, res: Response) => {
    const events = req.body.events

    console.log(events)

    if (events && events.length > 0) {

        if (events[0].type == 'follow') {
            await prisma.notify.create({
                data: {
                    uid: events[0].source.userId
                }
            })
        } else if (events[0].type == 'unfollow') {

            await prisma.notify.deleteMany({
                where: {
                    uid: events[0].source.userId
                }
            })

        }
        // console.log(events[0].message.text)
        // console.log(events[0].source.userId)
    }

    res.status(200).send({ message: "OK" })
})


app.listen(3001, () => {
    console.log(`Server is running on port 3001`)
})