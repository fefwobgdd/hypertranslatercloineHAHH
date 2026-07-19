/* Text transforms shared by the browser app. transformText remains a compatibility wrapper. */
(function () {
  function makeMap(plain, styled) {
    return Object.fromEntries([...plain].map((character, index) => [character, [...styled][index]]));
  }

  function fromMap(map) {
    const transform = (text) => [...text].map((character) => map[character] || character).join("");
    return { transform, transformText: (text) => transform(text) };
  }

  const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const boldSerif = fromMap(makeMap(latin, "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"));
  const boldSans = fromMap(makeMap(latin, "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"));
  const italic = fromMap(makeMap("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻"));
  const smallCaps = fromMap({ ...makeMap("abcdefghijklmnopqrstuvwxyz", "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀsᴛᴜᴠᴡxʏᴢ"), "!": "﹗", "$": "﹩", "%": "﹪", "&": "﹠", "*": "﹡", "(": "⁽", ")": "⁾", "_": "⁻", "-": "⁻", "=": "⁼", ":": "﹕", ";": "﹔", "?": "﹖" });

  window.transforms = { "Bold Serif": boldSerif, "Bold Sans": boldSans, Italic: italic, "Small Caps": smallCaps };
}());
