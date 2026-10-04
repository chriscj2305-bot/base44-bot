const express = require('express');
const app = express();
app.use(express.json());

const B44_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh";

function encodeBase44(buffer) {
    let value = BigInt('0x' + buffer.toString('hex'));
    if (value === 0n) return B44_CHARS;
    let result = [];
    while (value > 0n) {
        result.push(B44_CHARS[Number(value % 44n)]);
        value /= 44n;
    }
    return result.reverse().join("");
}

app.post('/webhook', (req, res) => {
    try {
        const matchData = req.body;
        const compact = matchData.map(m => ({
            id: m.match_id,
            teams: m.scores?.map(t => ({ uuid: t.team_uuid, score: t.current_score })) || []
        }));
        const b44Stream = encodeBase44(Buffer.from(JSON.stringify(compact)));
        console.log(`🤖 Base44 Stream: ${b44Stream}`);
        return res.status(200).json({ status: "success", base44_stream: b44Stream });
    } catch (e) {
        return res.status(400).json({ status: "error", message: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));
