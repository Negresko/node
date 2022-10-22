// Importando Dependencia EXPRESS
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { convertHoursStringsToMinutes } from './utils/convert-hours-string-to-minutes'
import { convertMinutesToHoursStrings } from './utils/convert-minutes-to-hours-string'

const app = express()
app.use(express.json())
app.use(cors())
const prisma = new PrismaClient()

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })

    return response.json(games)
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;
    const ads = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            weekDays: body.weekDays.join(','),
            discord: body.discord,
            useVoiceChannel: body.useVoiceChannel,
            yearsPlaying: body.yearsPlaying,
            hoursStart: convertHoursStringsToMinutes(body.hoursStart),
            hoursEnd: convertHoursStringsToMinutes(body.hoursEnd),
        },
    })
    return response.status(201).json(ads)
});

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            CreatedAt: 'desc',
        },
    })
    return response.json(ads.map(ad => {
        return {
            ...ad, 
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinutesToHoursStrings(ad.hoursStart),
            hoursEnd: convertMinutesToHoursStrings(ad.hoursEnd),
        }
    }))
});

app.get('/ads/:id/discord', async(request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true,
        },
        where: {
            id: adId,
        }
    })

    return response.json({
        discord: ad.discord,
    })

});
// Definindo Porta de Acesso
app.listen(3333)