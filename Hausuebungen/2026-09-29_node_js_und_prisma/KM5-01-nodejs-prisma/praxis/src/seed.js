// src/seed.js - Mini-Musik-DB befuellen (idempotent: erst leeren, dann neu).
import { prisma } from "./prisma.js";

async function main() {
  // Reihenfolge wegen Fremdschluesseln: Kinder/Verknuepfungen zuerst.
  await prisma.playlist.deleteMany();
  await prisma.song.deleteMany();
  await prisma.kuenstler.deleteMany();
  await prisma.label.deleteMany();

  await prisma.label.createMany({
    data: [{ name: "Ohrwurm Records" }, { name: "Indie Nord" }],
  });
  const ohrwurm = await prisma.label.findUnique({ where: { name: "Ohrwurm Records" } });
  const indie = await prisma.label.findUnique({ where: { name: "Indie Nord" } });

  await prisma.kuenstler.createMany({
    data: [
      { name: "Nova", labelId: ohrwurm.id },
      { name: "Pixel", labelId: ohrwurm.id },
      { name: "Solveig", labelId: indie.id },
      { name: "Ohne Label", labelId: null }, // fuer COUNT(*)-vs-COUNT(col)-Demo
    ],
  });
  const nova = await prisma.kuenstler.findFirst({ where: { name: "Nova" } });
  const pixel = await prisma.kuenstler.findFirst({ where: { name: "Pixel" } });
  const solveig = await prisma.kuenstler.findFirst({ where: { name: "Solveig" } });
  const ohne = await prisma.kuenstler.findFirst({ where: { name: "Ohne Label" } });

  await prisma.song.createMany({
    data: [
      { titel: "Nordlicht", dauerSek: 245, kuenstlerId: nova.id },
      { titel: "Glut", dauerSek: 210, kuenstlerId: nova.id },
      { titel: "Funkeln", dauerSek: 198, kuenstlerId: nova.id },
      { titel: "Pixelstaub", dauerSek: 305, kuenstlerId: pixel.id },
      { titel: "Raster", dauerSek: 233, kuenstlerId: pixel.id },
      { titel: "Fjord", dauerSek: 260, kuenstlerId: solveig.id },
      { titel: "Kurz", dauerSek: 120, kuenstlerId: ohne.id },
    ],
  });

  const songNordlicht = await prisma.song.findFirst({ where: { titel: "Nordlicht" } });
  const songPixelstaub = await prisma.song.findFirst({ where: { titel: "Pixelstaub" } });
  const songRaster = await prisma.song.findFirst({ where: { titel: "Raster" } });
  const songFunkeln = await prisma.song.findFirst({ where: { titel: "Funkeln" } });
  const songFjord = await prisma.song.findFirst({ where: { titel: "Fjord" } });

  // Playlists mit N:M-Verknuepfungen anlegen
  await prisma.playlist.create({
    data: {
      name: "Focus Beats",
      songs: {
        connect: [
          { id: songNordlicht.id },
          { id: songPixelstaub.id },
          { id: songRaster.id },
        ],
      },
    },
  });

  await prisma.playlist.create({
    data: {
      name: "Late Night",
      songs: {
        connect: [
          { id: songFunkeln.id },
          { id: songFjord.id },
        ],
      },
    },
  });

  const songs = await prisma.song.count();
  const kuenstler = await prisma.kuenstler.count();
  const playlists = await prisma.playlist.count();
  console.log(`Seed fertig: ${kuenstler} Kuenstler, ${songs} Songs, ${playlists} Playlists.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
