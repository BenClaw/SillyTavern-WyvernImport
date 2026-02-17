import express from 'express';
import fetch from 'node-fetch';
import sanitize from 'sanitize-filename';
import Jimp from 'jimp';
import pngChunkText from 'png-chunk-text';
import pngChunksEncode from 'png-chunks-encode';
import pngChunksExtract from 'png-chunks-extract';
import { Buffer } from 'buffer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

function write(buffer, data) {
    const chunks = pngChunksExtract(buffer);
    chunks.splice(-1, 0, pngChunkText('chara', Buffer.from(data).toString('base64')));
    return Buffer.from(pngChunksEncode(chunks));
}

async function downloadWyvernCharacter(id) {
    const result = await fetch(`https://app.wyvern.chat/api/characters/${id}`, {
        headers: { 'User-Agent': 'SillyTavern' },
    });

    if (!result.ok) {
        throw new Error('Failed to download character metadata');
    }

    const data = await result.json();

    const characterCard = {
        data: {
            name: data.name,
            description: data.description,
            personality: data.personality,
            scenario: data.scenario,
            first_mes: data.first_mes,
            mes_example: data.mes_example,
            creator_notes: data.creator_notes,
            system_prompt: data.pre_history_instructions,
            post_history_instructions: data.post_history_instructions,
            alternate_greetings: data.alternate_greetings,
            tags: data.tags,
            creator: data.creator?.displayName || data.creator?.vanityUrl || '',
            character_version: '',
            extensions: {},
        },
        spec: 'chara_card_v2',
        spec_version: '2.0',
    };

    let imageBuffer;
    if (data.avatar) {
        const imgRes = await fetch(data.avatar);
        if (imgRes.ok) {
            imageBuffer = Buffer.from(await imgRes.arrayBuffer());
        }
    }

    if (!imageBuffer) {
        throw new Error('No avatar found');
    }

    const image = await Jimp.read(imageBuffer);
    imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

    const buffer = write(imageBuffer, JSON.stringify(characterCard));
    return {
        buffer,
        fileName: `${sanitize(data.name)}.png`
    };
}

router.post('/import', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).send('No URL provided');

        const match = url.match(/characters\/([a-zA-Z0-9_-]+)/);
        if (!match) return res.status(400).send('Invalid Wyvern URL');

        const id = match[1];
        const { buffer, fileName } = await downloadWyvernCharacter(id);

        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', `attachment; filename="${encodeURI(fileName)}"`);
        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

export function init(app) {
    app.use('/api/plugins/wyvern', router);
    app.use('/scripts/extensions/third-party/wyvern-import', express.static(path.join(__dirname, 'public')));
    console.log('Wyvern Import Plugin Loaded');
}
