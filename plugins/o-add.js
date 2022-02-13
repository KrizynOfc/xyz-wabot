let fetch = require('node-fetch')
let handler = async (m, {
    conn,
    text,
    participants
}) => {
    if (m.quoted) {
        if (m.quoted.sender === m.quoted.sender === conn.user.jid) return;
        let usr = m.quoted.sender;
        await sock.groupParticipantsUpdate(
            m.chat,
            [usr],
            "add"
        )
    }
    let _participants = participants.map(user => user.jid)
    let users = (await Promise.all(
        text.split(',')
        .map(v => v.replace(/[^0-9]/g, ''))
        .filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
        .map(async v => [
            v,
            await conn.onWhatsApp(v + '@s.whatsapp.net')
        ])
    )).filter(v => v[1]).map(v => v[0] + '@c.us')
    let response = await sock.groupParticipantsUpdate(
        m.chat,
        [users],
        "add"
    )
    //let response = await conn.groupAdd(m.chat, users)
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => false)
    let jpegThumbnail = pp ? await (await fetch(pp)).buffer() : false
    for (let user of response.participants.filter(user => Object.values(user)[0].code == 403)) {
        let [
            [jid, {
                invite_code,
                invite_code_exp
            }]
        ] = Object.entries(user)
        let teks = `Mengundang @${jid.split('@')[0]} menggunakan invite...`
        m.reply(teks, null, {
            contextInfo: {
                mentionedJid: conn.parseMention(teks)
            }
        })
        await conn.sendGroupV4Invite(m.chat, jid, invite_code, invite_code_exp, false, 'Invitation to join my WhatsApp group', jpegThumbnail ? {
            jpegThumbnail
        } : {})
    }
}
handler.help = ['add', '+'].map(v => 'o' + v + ' @user')
handler.tags = ['owner']
handler.command = /^(oadd|o\+)$/i
handler.owner = true
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false

handler.admin = false
handler.botAdmin = true

handler.fail = null

module.exports = handler